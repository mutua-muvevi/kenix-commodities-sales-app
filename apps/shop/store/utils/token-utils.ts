// store/utils/token-utils.ts - Token utility functions
export const decodeToken = (token: string): { exp: number } => {
	try {
		// Mock decode for development - in production use proper JWT decode
		const currentTime = Math.floor(Date.now() / 1000);
		return {
			exp: currentTime + 3600, // 1 hour from now
		};
	} catch (error) {
		throw new Error("Invalid token");
	}
};

export const isTokenExpired = (token: string): boolean => {
	try {
		const decoded = decodeToken(token);
		const currentTime = Math.floor(Date.now() / 1000);
		return decoded.exp < currentTime;
	} catch (error) {
		return true;
	}
};

export const getTokenExpirationTime = (token: string): number | null => {
	try {
		const decoded = decodeToken(token);
		return decoded.exp;
	} catch (error) {
		return null;
	}
};
