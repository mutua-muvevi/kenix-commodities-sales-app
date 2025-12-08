// store/slices/products/products-store.ts - Complete products store
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Product, FetchProductsParams } from "../../types/product";
import { Pagination } from "../../types/common";

interface ProductsState {
	allProducts: {
		products: Product[];
		pagination: Pagination;
	};
	isLoadingProducts: boolean;
	error: string | null;
	fetchAllProducts: (params?: FetchProductsParams) => Promise<void>;
	clearProducts: () => void;
	resetError: () => void;
}

const mockProducts: Product[] = [
	{
		_id: "1",
		name: "Premium Rice",
		wholePrice: 50.0,
		unitPrice: 2.5,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "High quality basmati rice",
		images: ["https://picsum.photos/400/400?random=1"],
		category: "Grains",
		brand: "Premium Foods",
		inStock: true,
		tags: ["rice", "grains", "premium"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "2",
		name: "Fresh Tomatoes",
		wholePrice: 25.0,
		unitPrice: 1.5,
		quantity: 50,
		unitOfMeasure: "kg",
		description: "Fresh organic tomatoes",
		images: ["https://picsum.photos/400/400?random=2"],
		category: "Vegetables",
		brand: "Fresh Farm",
		inStock: true,
		tags: ["tomatoes", "vegetables", "organic"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "3",
		name: "Organic Apples",
		wholePrice: 30.0,
		unitPrice: 3.0,
		quantity: 75,
		unitOfMeasure: "kg",
		description: "Fresh organic red apples",
		images: ["https://picsum.photos/400/400?random=3"],
		category: "Fruits",
		brand: "Organic Farm",
		inStock: true,
		tags: ["apples", "fruits", "organic"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "4",
		name: "Whole Wheat Bread",
		wholePrice: 15.0,
		unitPrice: 2.5,
		quantity: 40,
		unitOfMeasure: "loaf",
		description: "Fresh whole wheat bread",
		images: ["https://picsum.photos/400/400?random=4"],
		category: "Bakery",
		brand: "Daily Bread",
		inStock: true,
		tags: ["bread", "wheat", "bakery"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const useProductsStore = create<ProductsState>()(
	devtools(
		(set, get) => ({
			allProducts: {
				products: [],
				pagination: {
					hasNextPage: false,
					nextCursor: null,
					totalCount: 0,
					limit: 20,
				},
			},
			isLoadingProducts: false,
			error: null,

			fetchAllProducts: async (params = {}) => {
				set({ isLoadingProducts: true, error: null });

				try {
					// Simulate API delay
					await new Promise((resolve) => setTimeout(resolve, 1000));

					const { search, limit = 20 } = params;
					let filteredProducts = mockProducts;

					if (search) {
						filteredProducts = mockProducts.filter(
							(product) =>
								product.name.toLowerCase().includes(search.toLowerCase()) ||
								product.description?.toLowerCase().includes(search.toLowerCase()) ||
								product.brand?.toLowerCase().includes(search.toLowerCase()),
						);
					}

					set({
						allProducts: {
							products: filteredProducts,
							pagination: {
								hasNextPage: false,
								nextCursor: null,
								totalCount: filteredProducts.length,
								limit,
							},
						},
						isLoadingProducts: false,
					});
				} catch (error) {
					set({
						error: (error as Error).message,
						isLoadingProducts: false,
					});
				}
			},

			clearProducts: () => {
				set({
					allProducts: {
						products: [],
						pagination: {
							hasNextPage: false,
							nextCursor: null,
							totalCount: 0,
							limit: 20,
						},
					},
				});
			},

			resetError: () => set({ error: null }),
		}),
		{ name: "products-store" },
	),
);
