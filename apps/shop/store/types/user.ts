// store/types/user.ts - Complete user types
export interface User {
	_id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	country?: string;
	emailVerified: boolean;
	isBanned: boolean;
	memberType?: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData {
	name: string;
	email: string;
	password: string;
	country?: string;
}

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	accessTokenExpires: number | null;
	refreshTokenExpires: number | null;
	authenticated: boolean;
	unauthenticated: boolean;
	loading: boolean;
	error: string | null;
}
