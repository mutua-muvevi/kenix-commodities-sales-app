import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS, CACHE_DURATION } from "../constants/api-endpoints";
import { sanitizeUser, USER_FIELDS } from "../utils/data-sanitizer";
import { User } from "../types/user";

interface UserApiResponse {
	success: boolean;
	message?: string;
	user?: User;
	users?: User[];
	meta?: {
		pageNum: number;
		limit: number;
		totalUsers: number;
		totalPages: number;
	};
	pagination?: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		pageSize: number;
	};
	error?: string;
}

export interface FetchUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export const userApi = {
	cache: new Map<string, { data: any; timestamp: number }>(),

	async getAllUsers(token: string, params: FetchUsersParams = {}) {
		const { page = 1, limit = 20, search, sortBy = "createdAt", sortOrder = "desc" } = params;
		const cacheKey = `all:${page}:${limit}:${search || "none"}:${sortBy}:${sortOrder}`;

		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await apiClient.get<UserApiResponse>(API_ENDPOINTS.FETCH_ALL_USERS, {
				params: { page, limit, search, sortBy, sortOrder },
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch users");
			}

			const data = {
				users: response.data.users!.map((user) => sanitizeUser(user, USER_FIELDS)),
				pagination: {
					hasNextPage: (response.data.meta?.pageNum || 1) < (response.data.meta?.totalPages || 1),
					nextCursor: null,
					totalCount: response.data.meta?.totalUsers || 0,
					limit: response.data.meta?.limit || 20,
					currentPage: response.data.meta?.pageNum || 1,
					totalPages: response.data.meta?.totalPages || 1,
				},
			};

			this.cache.set(cacheKey, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async searchUsers(token: string, params: FetchUsersParams = {}) {
		const { page = 1, limit = 20, search } = params;
		const cacheKey = `search:${page}:${limit}:${search || "none"}`;

		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await apiClient.get<UserApiResponse>(API_ENDPOINTS.FETCH_USERS_TYPING, {
				params: { search },
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to search users");
			}

			const data = {
				users: response.data.users!.map((user) => sanitizeUser(user, USER_FIELDS)),
				pagination: {
					hasNextPage: false,
					nextCursor: null,
					totalCount: response.data.users?.length || 0,
					limit: 100,
				},
			};

			this.cache.set(cacheKey, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async editUser(userId: string, data: FormData, token: string) {
		try {
			const response = await apiClient.patch<UserApiResponse>(API_ENDPOINTS.EDIT_USER(userId), data, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to edit user");
			}

			this.cache.clear();
			return sanitizeUser(response.data.user!, USER_FIELDS);
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async deleteUser(userId: string, token: string) {
		try {
			const response = await apiClient.delete<UserApiResponse>(API_ENDPOINTS.DELETE_USER, {
				headers: { Authorization: `Bearer ${token}` },
				data: { userId },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to delete user");
			}

			this.cache.clear();
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async deleteManyUsers(userIds: string[], token: string) {
		try {
			const response = await apiClient.delete<UserApiResponse>(API_ENDPOINTS.DELETE_MANY_USERS, {
				headers: { Authorization: `Bearer ${token}` },
				data: { userIds },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to delete users");
			}

			this.cache.clear();
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async banUser(userId: string, name: string, token: string) {
		try {
			const response = await apiClient.patch<UserApiResponse>(
				API_ENDPOINTS.BAN_USER,
				{ userId, name },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to ban user");
			}

			this.cache.clear();
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	clearCache() {
		this.cache.clear();
	},
};
