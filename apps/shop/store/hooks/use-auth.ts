// store/hooks/use-auth.ts
import { useAuthStore } from "../slices/auth/auth-store";

export const useAuth = () => {
	const {
		user,
		accessToken,
		authenticated,
		unauthenticated,
		loading,
		error,
		register,
		login,
		logout,
		initialize,
		resetError,
	} = useAuthStore();

	return {
		user,
		accessToken,
		authenticated,
		unauthenticated,
		loading,
		error,
		register,
		login,
		logout,
		initialize,
		resetError,
		isAdmin: user?.role === "admin",
		isLoggedIn: authenticated && !!user,
	};
};
