import { Category } from "../types/product";
import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS, CACHE_DURATION } from "../constants/api-endpoints";
import { sanitizeCategory, CATEGORY_FIELDS } from "../utils/data-sanitizer";

// Mock Categories with images - Fallback data when server is unavailable
const MOCK_CATEGORIES: Category[] = [
	{
		_id: "cat_1",
		name: "Fresh Fruits",
		image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop&auto=format",
		icon: "🍎",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_2",
		name: "Fresh Vegetables",
		image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&auto=format",
		icon: "🥬",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_3",
		name: "Grains & Cereals",
		image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format",
		icon: "🌾",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_4",
		name: "Dairy Products",
		image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format",
		icon: "🥛",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_5",
		name: "Bakery",
		image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format",
		icon: "🍞",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_6",
		name: "Meat & Poultry",
		image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format",
		icon: "🥩",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_7",
		name: "Beverages",
		image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&auto=format",
		icon: "🥤",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "cat_8",
		name: "Snacks",
		image: "https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=300&fit=crop&auto=format",
		icon: "🍿",
		products: [],
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

interface CategoryApiResponse {
	success: boolean;
	message?: string;
	category?: Category;
	categories?: Category[];
	error?: string;
}

interface DataSourceInfo {
	usingMock: boolean;
	usingServer: boolean;
	lastError: string | null;
}

export const categoryApi = {
	cache: new Map<string, { data: any; timestamp: number }>(),
	_dataSourceInfo: {
		usingMock: false,
		usingServer: false,
		lastError: null as string | null,
	},

	getDataSourceInfo(): DataSourceInfo {
		return { ...this._dataSourceInfo };
	},

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

			const serverCategories = response.data.categories || [];

			// If server returns empty, use mock data
			if (serverCategories.length === 0) {
				console.log("[CategoryAPI] Server returned empty, using mock categories");
				this._dataSourceInfo = { usingMock: true, usingServer: false, lastError: null };
				this.cache.set(cacheKey, { data: MOCK_CATEGORIES, timestamp: Date.now() });
				return MOCK_CATEGORIES;
			}

			const categories = serverCategories.map((cat) =>
				sanitizeCategory(cat, CATEGORY_FIELDS),
			);

			this._dataSourceInfo = { usingMock: false, usingServer: true, lastError: null };
			this.cache.set(cacheKey, { data: categories, timestamp: Date.now() });
			return categories;
		} catch (error) {
			// Fallback to mock data on error
			console.log("[CategoryAPI] Server error, falling back to mock categories:", (error as Error).message);
			this._dataSourceInfo = {
				usingMock: true,
				usingServer: false,
				lastError: (error as Error).message
			};
			this.cache.set(cacheKey, { data: MOCK_CATEGORIES, timestamp: Date.now() });
			return MOCK_CATEGORIES;
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
			// Fallback to mock data
			const mockCategory = MOCK_CATEGORIES.find(cat => cat._id === id) || null;
			this.cache.set(cacheKey, { data: mockCategory, timestamp: Date.now() });
			return mockCategory;
		}
	},

	clearCache() {
		this.cache.clear();
		this._dataSourceInfo = { usingMock: false, usingServer: false, lastError: null };
	},
};

// Export as default and named export for backward compatibility
export const enhancedCategoryApi = categoryApi;
export default categoryApi;
