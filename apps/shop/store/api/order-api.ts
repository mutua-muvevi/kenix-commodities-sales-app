import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import { Order, CreateOrderData } from "../types/order";
import { sanitizeOrder, ORDER_FIELDS } from "../utils/data-sanitizer";

interface OrderApiResponse {
	success: boolean;
	message?: string;
	order?: Order;
	orders?: Order[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export const orderApi = {
	async createOrder(data: CreateOrderData, token: string): Promise<Order> {
		try {
			const response = await apiClient.post<OrderApiResponse>(API_ENDPOINTS.ORDERS, data, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to create order");
			}

			return sanitizeOrder(response.data.order!, ORDER_FIELDS);
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async getMyOrders(token: string, page = 1, limit = 20) {
		try {
			const response = await apiClient.get<OrderApiResponse>(API_ENDPOINTS.MY_ORDERS, {
				headers: { Authorization: `Bearer ${token}` },
				params: { page, limit },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch orders");
			}

			return {
				orders: (response.data.orders || []).map((order) => sanitizeOrder(order, ORDER_FIELDS)),
				pagination: {
					hasNextPage: (response.data.meta?.page || 1) < (response.data.meta?.totalPages || 1),
					nextCursor: null,
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

	async getOrderById(id: string, token: string): Promise<Order> {
		try {
			const response = await apiClient.get<OrderApiResponse>(API_ENDPOINTS.ORDER_BY_ID(id), {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Order not found");
			}

			return sanitizeOrder(response.data.order!, ORDER_FIELDS);
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async updateOrderStatus(id: string, status: string, token: string): Promise<Order> {
		try {
			const response = await apiClient.patch<OrderApiResponse>(
				API_ENDPOINTS.UPDATE_ORDER_STATUS(id),
				{ status },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to update order status");
			}

			return sanitizeOrder(response.data.order!, ORDER_FIELDS);
		} catch (error) {
			throw parseApiError(error as any);
		}
	},
};

export default orderApi;
