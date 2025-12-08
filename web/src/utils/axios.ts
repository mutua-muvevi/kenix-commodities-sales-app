// src/utils/axios.ts - FIXED VERSION
/**
 * Axios configuration for API requests with authentication, error handling, and retries.
 * FIXED: Proper token handling that matches your auth system
 */

import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { parseApiError } from "@/store/utils/api-utils";

// FIXED: Axios instance configuration with proper token handling
const axiosInstance: AxiosInstance = Axios.create({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7979",
	timeout: 15000, // Increased timeout for admin operations
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// FIXED: Request interceptor that matches your auth system
axiosInstance.interceptors.request.use(
	(config) => {
		if (typeof window !== "undefined") {
			// Your system stores token as "Bearer TOKEN" in sessionStorage with key "token"
			const token = sessionStorage.getItem("token");

			if (token && config.headers) {
				// Token is already in "Bearer TOKEN" format, use directly
				config.headers.Authorization = token;
			}

			// Add additional headers for debugging
			config.headers["X-Client-Version"] = "2.0.0";
			config.headers["X-Request-Time"] = new Date().toISOString();
		}

		return config;
	},
	(error) => {
		console.error("Request interceptor error:", error);
		return Promise.reject(error);
	},
);

// FIXED: Response interceptor with better error handling
axiosInstance.interceptors.response.use(
	(response) => {
		// Log successful responses in development
		if (process.env.NODE_ENV === "development") {
			console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
				status: response.status,
				data: response.data?.success ? "Success" : "Check response",
			});
		}
		return response;
	},
	(error: AxiosError) => {
		// Enhanced error logging
		if (error.response) {
			console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
				status: error.response.status,
				statusText: error.response.statusText,
				data: error.response.data,
				headers: error.response.headers,
			});

			// Handle specific auth errors
			if (error.response.status === 401) {
				console.warn("🔐 Authentication failed - clearing session");
				if (typeof window !== "undefined") {
					sessionStorage.removeItem("token");
					sessionStorage.removeItem("refreshToken");
					sessionStorage.removeItem("accessToken");
					sessionStorage.removeItem("expires");
					sessionStorage.removeItem("refreshTokenExpires");

					// Redirect to login if not already on auth page
					if (!window.location.pathname.includes("/auth")) {
						window.location.href = "/auth/login";
					}
				}
			}

			if (error.response.status === 403) {
				console.warn("🚫 Access denied - insufficient permissions");
			}
		} else if (error.request) {
			console.error("🌐 Network Error:", error.message);
		} else {
			console.error("⚠️ Request Setup Error:", error.message);
		}

		const message = parseApiError(error);
		return Promise.reject(new Error(message));
	},
);

// FIXED: Retry logic with exponential backoff
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
	const config = error.config as AxiosRequestConfig & { retryCount?: number };
	if (!config) return Promise.reject(error);

	// Don't retry auth errors or client errors
	if (error.response && [400, 401, 403, 404].includes(error.response.status)) {
		return Promise.reject(error);
	}

	config.retryCount = config.retryCount || 0;
	if (config.retryCount >= MAX_RETRIES) {
		console.error(`Max retries (${MAX_RETRIES}) exceeded for ${config.url}`);
		return Promise.reject(error);
	}

	config.retryCount += 1;
	const delay = Math.pow(2, config.retryCount) * RETRY_DELAY_BASE; // Exponential backoff

	// console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}) after ${delay}ms: ${config.url}`);

	await new Promise((resolve) => setTimeout(resolve, delay));
	return axiosInstance(config);
});

// FIXED: Helper function to check token validity
export const checkTokenValidity = (): boolean => {
	if (typeof window === "undefined") return false;

	const token = sessionStorage.getItem("token");
	if (!token) return false;

	try {
		// Check token format
		const parts = token.split(" ");
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return false;
		}

		// Check JWT structure
		const jwtParts = parts[1].split(".");
		if (jwtParts.length !== 3) {
			return false;
		}

		// Decode and check expiration
		const payload = JSON.parse(atob(jwtParts[1].replace(/-/g, "+").replace(/_/g, "/")));
		const currentTime = Math.floor(Date.now() / 1000);

		return payload.exp > currentTime;
	} catch {
		return false;
	}
};

// FIXED: Helper function to refresh token if needed
export const ensureValidToken = async (): Promise<boolean> => {
	if (checkTokenValidity()) {
		return true;
	}

	// Try to refresh token
	const refreshToken = sessionStorage.getItem("refreshToken");
	if (!refreshToken) {
		return false;
	}

	try {
		// Import your refresh token function
		const { getRefreshAndAccessToken } = await import("@/auth/context/utils");
		await getRefreshAndAccessToken(refreshToken);
		return checkTokenValidity();
	} catch {
		return false;
	}
};

export default axiosInstance;
