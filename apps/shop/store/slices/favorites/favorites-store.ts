// store/slices/favorites/favorites-store.ts - Complete favorites store
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { Product } from "../../types/product";
import { secureStorage } from "../../middleware/persist";

interface FavoriteItem {
	productId: string;
	name: string;
	unitPrice: number;
	image?: string;
	addedAt: string;
}

interface FavoritesState {
	favorites: FavoriteItem[];
	isLoading: boolean;
	error: string | null;

	// Actions
	addFavorite: (product: Product) => void;
	removeFavorite: (productId: string) => void;
	toggleFavorite: (product: Product) => void;
	clearFavorites: () => void;
	isFavorite: (productId: string) => boolean;
	getFavoriteById: (productId: string) => FavoriteItem | undefined;
	resetError: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
	devtools(
		persist(
			(set, get) => ({
				favorites: [],
				isLoading: false,
				error: null,

				addFavorite: (product) => {
					const { favorites } = get();
					const existingFavorite = favorites.find((fav) => fav.productId === product._id);

					if (!existingFavorite) {
						const newFavorite: FavoriteItem = {
							productId: product._id,
							name: product.name,
							unitPrice: product.unitPrice,
							image: product.images?.[0],
							addedAt: new Date().toISOString(),
						};
						set({ favorites: [...favorites, newFavorite] });
					}
				},

				removeFavorite: (productId) => {
					const { favorites } = get();
					const newFavorites = favorites.filter((fav) => fav.productId !== productId);
					set({ favorites: newFavorites });
				},

				toggleFavorite: (product) => {
					const { isFavorite, addFavorite, removeFavorite } = get();

					if (isFavorite(product._id)) {
						removeFavorite(product._id);
					} else {
						addFavorite(product);
					}
				},

				clearFavorites: () => {
					set({ favorites: [] });
				},

				isFavorite: (productId) => {
					const { favorites } = get();
					return favorites.some((fav) => fav.productId === productId);
				},

				getFavoriteById: (productId) => {
					const { favorites } = get();
					return favorites.find((fav) => fav.productId === productId);
				},

				resetError: () => set({ error: null }),
			}),
			{
				name: "shop-favorites-store",
				storage: createJSONStorage(() => secureStorage),
				partialize: (state) => ({
					favorites: state.favorites,
				}),
			},
		),
		{ name: "favorites-store" },
	),
);
