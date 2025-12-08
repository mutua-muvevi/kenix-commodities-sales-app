// store/hooks/use-favorites.ts - Complete favorites hook
import { useFavoritesStore } from "../slices/favorites/favorites-store";

export const useFavorites = () => {
	const {
		favorites,
		isLoading,
		error,
		addFavorite,
		removeFavorite,
		toggleFavorite,
		clearFavorites,
		isFavorite,
		getFavoriteById,
		resetError,
	} = useFavoritesStore();

	return {
		favorites,
		isLoading,
		error,
		addFavorite,
		removeFavorite,
		toggleFavorite,
		clearFavorites,
		isFavorite,
		getFavoriteById,
		resetError,
		// Computed values
		hasFavorites: favorites.length > 0,
		favoriteCount: favorites.length,
		isEmpty: favorites.length === 0,
	};
};
