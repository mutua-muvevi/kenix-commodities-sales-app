import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { enhancedCategoryApi } from "../../api/category-api";
import { Category } from "../../types/product";

interface CategoriesState {
	categories: Category[];
	isLoadingCategories: boolean;
	error: string | null;
	dataSource: "mock" | "server" | "hybrid" | null;
	lastFetchTimestamp: number | null;

	// Actions
	fetchCategories: () => Promise<void>;
	getCategoryById: (id: string) => Promise<Category | null>;
	clearCategories: () => void;
	resetError: () => void;
	refreshCategories: () => Promise<void>;

	// Computed getters
	hasCategories: () => boolean;
	getCategoryCount: () => number;
	getCategoriesByName: (searchTerm: string) => Category[];
	getFeaturedCategories: (limit?: number) => Category[];
}

export const useCategoriesStore = create<CategoriesState>()(
	devtools(
		(set, get) => ({
			categories: [],
			isLoadingCategories: false,
			error: null,
			dataSource: null,
			lastFetchTimestamp: null,

			fetchCategories: async () => {
				set({ isLoadingCategories: true, error: null });

				try {
					const categories = await enhancedCategoryApi.getAllCategories();
					const dataSourceInfo = enhancedCategoryApi.getDataSourceInfo();

					set({
						categories,
						isLoadingCategories: false,
						dataSource: dataSourceInfo.usingMock
							? "mock"
							: dataSourceInfo.usingServer
								? "server"
								: "hybrid",
						lastFetchTimestamp: Date.now(),
					});
				} catch (error) {
					set({
						error: (error as Error).message,
						isLoadingCategories: false,
					});
				}
			},

			getCategoryById: async (id: string) => {
				try {
					return await enhancedCategoryApi.getCategoryById(id);
				} catch (error) {
					console.error("Error fetching category by ID:", error);
					return null;
				}
			},

			refreshCategories: async () => {
				enhancedCategoryApi.clearCache();
				await get().fetchCategories();
			},

			clearCategories: () => {
				set({
					categories: [],
					dataSource: null,
					lastFetchTimestamp: null,
				});
			},

			resetError: () => set({ error: null }),

			// Computed getters
			hasCategories: () => get().categories.length > 0,

			getCategoryCount: () => get().categories.length,

			getCategoriesByName: (searchTerm: string) => {
				const { categories } = get();
				const lowercaseSearch = searchTerm.toLowerCase();
				return categories.filter((category) => category.name.toLowerCase().includes(lowercaseSearch));
			},

			getFeaturedCategories: (limit = 6) => {
				const { categories } = get();
				return categories.slice(0, limit);
			},
		}),
		{ name: "categories-store" },
	),
);
