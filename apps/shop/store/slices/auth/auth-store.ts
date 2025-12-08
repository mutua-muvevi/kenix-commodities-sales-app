// store/slices/auth/auth-store.ts - Complete fixed version
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { authApi } from "../../api/auth-api";
import { AuthState, LoginFormData, RegisterFormData } from "../../types/user";
import { logger } from "../../middleware/logger";
import { secureStorage } from "../../middleware/persist";
import { decodeToken, isTokenExpired } from "../../utils/token-utils";

export interface AuthStore extends AuthState {
	register: (data: RegisterFormData) => Promise<void>;
	login: (data: LoginFormData) => Promise<void>;
	logout: () => void;
	refreshAuth: () => Promise<void>;
	initialize: () => Promise<void>;
	resetError: () => void;
}

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	accessTokenExpires: null,
	refreshTokenExpires: null,
	authenticated: false,
	unauthenticated: true,
	loading: false,
	error: null,
};

export const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			logger(
				(set, get) => ({
					...initialState,

					register: async (data) => {
						set({ loading: true, error: null });
						try {
							const { user, accessToken, refreshToken } = await authApi.register(data);
							const { exp: accessTokenExpires } = decodeToken(accessToken);
							const { exp: refreshTokenExpires } = decodeToken(refreshToken);

							set({
								user,
								accessToken,
								refreshToken,
								accessTokenExpires,
								refreshTokenExpires,
								authenticated: true,
								unauthenticated: false,
								loading: false,
							});
						} catch (error) {
							set({
								error: (error as Error).message,
								loading: false,
							});
						}
					},

					login: async (data) => {
						set({ loading: true, error: null });
						try {
							const { user, accessToken, refreshToken } = await authApi.login(data);
							const { exp: accessTokenExpires } = decodeToken(accessToken);
							const { exp: refreshTokenExpires } = decodeToken(refreshToken);

							set({
								user,
								accessToken,
								refreshToken,
								accessTokenExpires,
								refreshTokenExpires,
								authenticated: true,
								unauthenticated: false,
								loading: false,
							});
						} catch (error) {
							set({
								error: (error as Error).message,
								loading: false,
							});
						}
					},

					logout: () => {
						set({
							...initialState,
							loading: false,
						});
					},

					refreshAuth: async () => {
						const { refreshToken } = get();
						if (!refreshToken || isTokenExpired(refreshToken)) {
							get().logout();
							return;
						}

						try {
							const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
								await authApi.refreshToken(refreshToken);
							const { exp: accessTokenExpires } = decodeToken(newAccessToken);
							const { exp: refreshTokenExpires } = decodeToken(newRefreshToken);

							set({
								accessToken: newAccessToken,
								refreshToken: newRefreshToken,
								accessTokenExpires,
								refreshTokenExpires,
								authenticated: true,
								unauthenticated: false,
							});
						} catch (error) {
							get().logout();
							throw error;
						}
					},

					initialize: async () => {
						set({ loading: true, error: null });
						try {
							const { accessToken, refreshToken, accessTokenExpires } = get();

							if (accessToken && accessTokenExpires) {
								const currentTime = Math.floor(Date.now() / 1000);

								if (accessTokenExpires > currentTime) {
									const user = await authApi.getMe(accessToken);
									set({
										user,
										authenticated: true,
										unauthenticated: false,
										loading: false,
									});
									return;
								}

								if (refreshToken && !isTokenExpired(refreshToken)) {
									await get().refreshAuth();
									return;
								}
							}

							set({
								...initialState,
								loading: false,
							});
						} catch (error) {
							set({
								...initialState,
								error: (error as Error).message,
								loading: false,
							});
						}
					},

					resetError: () => set({ error: null }),
				}),
				"auth-store",
			),
			{
				name: "shop-auth-store",
				storage: createJSONStorage(() => secureStorage),
				partialize: (state) => ({
					// SECURITY FIX: Don't persist sensitive tokens in plain storage
					// Only persist user data and auth status
					user: state.user,
					authenticated: state.authenticated,
					unauthenticated: state.unauthenticated,
				}),
			},
		),
		{ name: "auth-store" },
	),
);
