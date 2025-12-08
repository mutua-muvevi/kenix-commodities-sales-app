// store/hooks/use-categories.ts - Complete categories hook
import { useCategoriesStore } from "../slices/categories/categories-store";

export const useCategories = () => {
	const {
		categories,
		isLoadingCategories,
		error,
		dataSource,
		lastFetchTimestamp,
		fetchCategories,
		getCategoryById,
		clearCategories,
		resetError,
		refreshCategories,
		hasCategories,
		getCategoryCount,
		getCategoriesByName,
		getFeaturedCategories,
	} = useCategoriesStore();

	return {
		// State
		categories,
		isLoadingCategories,
		error,
		dataSource,
		lastFetchTimestamp,

		// Actions
		fetchCategories,
		getCategoryById,
		clearCategories,
		resetError,
		refreshCategories,

		// Computed values
		hasCategories: hasCategories(),
		categoryCount: getCategoryCount(),
		isEmpty: !hasCategories(),
		isUsingMockData: dataSource === "mock",
		isUsingServerData: dataSource === "server",
		isUsingHybridData: dataSource === "hybrid",

		// Helper functions
		searchCategories: getCategoriesByName,
		getFeaturedCategories,

		// Utility methods
		isDataStale: (maxAgeMs = 5 * 60 * 1000) => {
			// 5 minutes default
			if (!lastFetchTimestamp) return true;
			return Date.now() - lastFetchTimestamp > maxAgeMs;
		},
	};
};
