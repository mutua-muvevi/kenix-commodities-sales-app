import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS } from "../constants/api-endpoints";

interface AirtimeResponse {
	success: boolean;
	transaction?: AirtimeTransaction;
	transactions?: AirtimeTransaction[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
	message?: string;
}

export interface AirtimeTransaction {
	_id: string;
	transactionId: string;
	shopId: string;
	type: "buy" | "sell";
	phoneNumber: string;
	amount: number;
	provider: "Safaricom" | "Airtel";
	status: "pending" | "success" | "failed";
	mpesaReceiptNumber?: string;
	createdAt: string;
	updatedAt: string;
}

export interface BuyAirtimeData {
	phoneNumber: string;
	amount: number;
	provider?: "Safaricom" | "Airtel";
}

export interface SellAirtimeData {
	phoneNumber: string;
	amount: number;
	provider?: "Safaricom" | "Airtel";
}

export const airtimeApi = {
	/**
	 * Buy airtime
	 */
	async buyAirtime(data: BuyAirtimeData, token: string): Promise<AirtimeTransaction> {
		try {
			const response = await apiClient.post<AirtimeResponse>(
				API_ENDPOINTS.AIRTIME_BUY,
				{
					phoneNumber: data.phoneNumber,
					amount: data.amount,
					provider: data.provider || "Safaricom",
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || response.data.message || "Failed to buy airtime");
			}

			return response.data.transaction!;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Sell airtime
	 */
	async sellAirtime(data: SellAirtimeData, token: string): Promise<AirtimeTransaction> {
		try {
			const response = await apiClient.post<AirtimeResponse>(
				API_ENDPOINTS.AIRTIME_SELL,
				{
					phoneNumber: data.phoneNumber,
					amount: data.amount,
					provider: data.provider || "Safaricom",
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || response.data.message || "Failed to sell airtime");
			}

			return response.data.transaction!;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Get airtime transactions for a shop
	 */
	async getShopTransactions(shopId: string, token: string, page = 1, limit = 20) {
		try {
			const response = await apiClient.get<AirtimeResponse>(
				`${API_ENDPOINTS.AIRTIME_TRANSACTIONS}/shop/${shopId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
					params: { page, limit },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch airtime transactions");
			}

			return {
				transactions: response.data.transactions || [],
				pagination: {
					hasNextPage: (response.data.meta?.page || 1) < (response.data.meta?.totalPages || 1),
					totalCount: response.data.meta?.total || 0,
					limit: response.data.meta?.limit || 20,
					currentPage: response.data.meta?.page || 1,
					totalPages: response.data.meta?.totalPages || 1,
				},
			};
		} catch (error) {
			throw parseApiError(error as any);
		}
	},
};

export default airtimeApi;
