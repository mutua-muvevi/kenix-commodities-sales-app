import axios, { AxiosError } from "axios";

export const parseApiError = (error: AxiosError): Error => {
	if (error.response?.data) {
		const data = error.response.data as { error?: string; message?: string };
		const message = data.error || data.message || "An unexpected error occurred";
		return new Error(message);
	}
	return new Error(error.message || "Network error");
};

export const createApiClient = () => {
	const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

	return axios.create({
		baseURL,
		timeout: 10000,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export const apiClient = createApiClient();
