import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS, CACHE_DURATION } from "../constants/api-endpoints";
import { sanitizeProduct, PRODUCT_FIELDS } from "../utils/data-sanitizer";
import { Product, FetchProductsParams } from "../types/product";

interface ProductApiResponse {
	success: boolean;
	message?: string;
	product?: Product;
	products?: Product[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export const productApi = {
	cache: new Map<string, { data: any; timestamp: number }>(),

	async getAllProducts(params: FetchProductsParams = {}) {
		const { cursor, limit = 20, search, category, sortBy = "createdAt", sortOrder = "desc" } = params;
		const cacheKey = `products:${cursor || "start"}:${limit}:${search || "none"}:${category || "none"}:${sortBy}:${sortOrder}`;

		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			// Build query parameters
			const queryParams: any = {
				limit,
				sortBy,
				sortOrder,
				isInStock: true, // Only show in-stock products for shop
			};

			if (cursor) queryParams.cursor = cursor;
			if (search) queryParams.search = search;
			if (category) queryParams.category = category;

			const response = await apiClient.get<ProductApiResponse>(API_ENDPOINTS.PRODUCTS, {
				params: queryParams,
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch products");
			}

			const data = {
				products: (response.data.products || []).map((product) => sanitizeProduct(product, PRODUCT_FIELDS)),
				pagination: {
					hasNextPage: (response.data.meta?.page || 1) < (response.data.meta?.totalPages || 1),
					nextCursor: null,
					totalCount: response.data.meta?.total || 0,
					limit: response.data.meta?.limit || 20,
				},
			};

			this.cache.set(cacheKey, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async getProductById(id: string) {
		const cacheKey = `product:${id}`;
		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await apiClient.get<ProductApiResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id));

			if (!response.data.success) {
				throw new Error(response.data.error || "Product not found");
			}

			const data = sanitizeProduct(response.data.product!, PRODUCT_FIELDS);
			this.cache.set(cacheKey, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	clearCache() {
		this.cache.clear();
	},
};
