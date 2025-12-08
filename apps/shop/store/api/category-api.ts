import { Category } from "../types/product";
import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS, CACHE_DURATION } from "../constants/api-endpoints";
import { sanitizeCategory, CATEGORY_FIELDS } from "../utils/data-sanitizer";

interface CategoryApiResponse {
	success: boolean;
	message?: string;
	category?: Category;
	categories?: Category[];
	error?: string;
}

export const categoryApi = {
	cache: new Map<string, { data: any; timestamp: number }>(),

	async getAllCategories(): Promise<Category[]> {
		const cacheKey = "categories:all";
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await apiClient.get<CategoryApiResponse>(API_ENDPOINTS.CATEGORIES);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch categories");
			}

			const categories = (response.data.categories || []).map((cat) =>
				sanitizeCategory(cat, CATEGORY_FIELDS),
			);

			this.cache.set(cacheKey, { data: categories, timestamp: Date.now() });
			return categories;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	async getCategoryById(id: string): Promise<Category | null> {
		const cacheKey = `category:${id}`;
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await apiClient.get<CategoryApiResponse>(API_ENDPOINTS.CATEGORY_BY_ID(id));

			if (!response.data.success) {
				throw new Error(response.data.error || "Category not found");
			}

			const category = response.data.category
				? sanitizeCategory(response.data.category, CATEGORY_FIELDS)
				: null;

			this.cache.set(cacheKey, { data: category, timestamp: Date.now() });
			return category;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	clearCache() {
		this.cache.clear();
	},
};

// Export as default and named export for backward compatibility
export const enhancedCategoryApi = categoryApi;
export default categoryApi;
