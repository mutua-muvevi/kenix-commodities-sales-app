// store/api/auth-api.ts - Updated with comprehensive mock data
import { User, LoginFormData, RegisterFormData } from "../types/user";
import { mockUsers } from "../data/mock-data";

export const authApi = {
	async login(data: LoginFormData) {
		// Mock API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock validation - use any of the mock users
		if (data.email === "john@example.com" && data.password === "password") {
			return {
				user: mockUsers[0], // John Doe
				accessToken: "mock-access-token-john",
				refreshToken: "mock-refresh-token-john",
			};
		}

		if (data.email === "jane@example.com" && data.password === "admin") {
			return {
				user: mockUsers[1], // Jane Smith (Admin)
				accessToken: "mock-access-token-jane",
				refreshToken: "mock-refresh-token-jane",
			};
		}

		// Generic test credentials
		if (data.email === "test@test.com" && data.password === "password") {
			return {
				user: mockUsers[0],
				accessToken: "mock-access-token",
				refreshToken: "mock-refresh-token",
			};
		}

		throw new Error("Invalid credentials. Try: john@example.com / password or jane@example.com / admin");
	},

	async register(data: RegisterFormData) {
		// Mock API delay
		await new Promise((resolve) => setTimeout(resolve, 1200));

		// Create new user based on registration data
		const newUser: User = {
			_id: `user_${Date.now()}`,
			name: data.name,
			email: data.email,
			role: "user",
			country: data.country || "Kenya",
			emailVerified: false, // New users need to verify email
			isBanned: false,
			memberType: "standard",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return {
			user: newUser,
			accessToken: `mock-access-token-${Date.now()}`,
			refreshToken: `mock-refresh-token-${Date.now()}`,
		};
	},

	async getMe(token: string) {
		// Mock API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Return user based on token
		if (token.includes("john")) {
			return mockUsers[0];
		}

		if (token.includes("jane")) {
			return mockUsers[1];
		}

		// Default return first user for any valid token
		if (token.startsWith("mock-access-token")) {
			return mockUsers[0];
		}

		throw new Error("Invalid token");
	},

	async refreshToken(refreshToken: string) {
		// Mock API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		if (refreshToken.startsWith("mock-refresh-token")) {
			return {
				accessToken: `new-mock-access-token-${Date.now()}`,
				refreshToken: `new-mock-refresh-token-${Date.now()}`,
			};
		}

		throw new Error("Invalid refresh token");
	},
};
