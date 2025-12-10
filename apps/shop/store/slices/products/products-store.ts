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
	getProductById: (id: string) => Product | undefined;
	clearProducts: () => void;
	resetError: () => void;
}

const mockProducts: Product[] = [
	{
		_id: "1",
		name: "Premium Basmati Rice",
		wholePrice: 5000.0,
		unitPrice: 250.0,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "High quality aromatic basmati rice, imported from India. Perfect for biryani and pilaf. Long grain, aged for 2 years for enhanced aroma and taste.",
		images: ["https://picsum.photos/400/400?random=1", "https://picsum.photos/400/400?random=11"],
		category: "Grains",
		brand: "Premium Foods",
		inStock: true,
		tags: ["rice", "grains", "premium", "basmati"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "2",
		name: "Fresh Tomatoes",
		wholePrice: 2500.0,
		unitPrice: 150.0,
		quantity: 50,
		unitOfMeasure: "kg",
		description: "Fresh organic tomatoes from local farms. Juicy, ripe, and perfect for salads, cooking, and sauces. Rich in vitamins and antioxidants.",
		images: ["https://picsum.photos/400/400?random=2", "https://picsum.photos/400/400?random=12"],
		category: "Vegetables",
		brand: "Fresh Farm",
		inStock: true,
		tags: ["tomatoes", "vegetables", "organic", "fresh"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "3",
		name: "Organic Red Apples",
		wholePrice: 3000.0,
		unitPrice: 300.0,
		quantity: 75,
		unitOfMeasure: "kg",
		description: "Fresh organic red apples. Crisp, sweet, and juicy. Grown without pesticides. Perfect for snacking or baking.",
		images: ["https://picsum.photos/400/400?random=3", "https://picsum.photos/400/400?random=13"],
		category: "Fruits",
		brand: "Organic Farm",
		inStock: true,
		tags: ["apples", "fruits", "organic", "fresh"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "4",
		name: "Whole Wheat Bread",
		wholePrice: 1500.0,
		unitPrice: 250.0,
		quantity: 40,
		unitOfMeasure: "loaf",
		description: "Fresh whole wheat bread baked daily. Soft texture, rich in fiber. Perfect for sandwiches and toast.",
		images: ["https://picsum.photos/400/400?random=4", "https://picsum.photos/400/400?random=14"],
		category: "Bakery",
		brand: "Daily Bread",
		inStock: true,
		tags: ["bread", "wheat", "bakery", "fresh"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "5",
		name: "Fresh Milk",
		wholePrice: 3500.0,
		unitPrice: 120.0,
		quantity: 200,
		unitOfMeasure: "liter",
		description: "Fresh pasteurized milk from local dairy farms. Rich in calcium and protein. Perfect for drinking, cooking, and baking.",
		images: ["https://picsum.photos/400/400?random=5", "https://picsum.photos/400/400?random=15"],
		category: "Dairy",
		brand: "Fresh Dairy",
		inStock: true,
		tags: ["milk", "dairy", "fresh", "calcium"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "6",
		name: "Natural Orange Juice",
		wholePrice: 4000.0,
		unitPrice: 180.0,
		quantity: 150,
		unitOfMeasure: "liter",
		description: "100% natural orange juice with no added sugar or preservatives. Fresh squeezed daily. Rich in Vitamin C.",
		images: ["https://picsum.photos/400/400?random=6", "https://picsum.photos/400/400?random=16"],
		category: "Beverages",
		brand: "Fresh Squeeze",
		inStock: true,
		tags: ["juice", "beverages", "orange", "natural"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "7",
		name: "Potato Chips - Salt",
		wholePrice: 2000.0,
		unitPrice: 100.0,
		quantity: 300,
		unitOfMeasure: "pack",
		description: "Crispy potato chips lightly salted. Made from fresh potatoes. Perfect snack for any occasion.",
		images: ["https://picsum.photos/400/400?random=7", "https://picsum.photos/400/400?random=17"],
		category: "Snacks",
		brand: "Crispy Bites",
		inStock: true,
		tags: ["chips", "snacks", "potato", "salty"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "8",
		name: "Laundry Detergent",
		wholePrice: 3200.0,
		unitPrice: 350.0,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "Powerful laundry detergent powder. Removes tough stains and leaves clothes fresh. Suitable for all fabric types.",
		images: ["https://picsum.photos/400/400?random=8", "https://picsum.photos/400/400?random=18"],
		category: "Household",
		brand: "Clean Pro",
		inStock: true,
		tags: ["detergent", "household", "cleaning", "laundry"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "9",
		name: "Maize Flour",
		wholePrice: 4500.0,
		unitPrice: 180.0,
		quantity: 250,
		unitOfMeasure: "kg",
		description: "Fine quality maize flour for making ugali and porridge. Milled from premium white maize. Rich in carbohydrates.",
		images: ["https://picsum.photos/400/400?random=9", "https://picsum.photos/400/400?random=19"],
		category: "Grains",
		brand: "Mill Fresh",
		inStock: true,
		tags: ["maize", "flour", "grains", "ugali"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "10",
		name: "Fresh Spinach",
		wholePrice: 1800.0,
		unitPrice: 80.0,
		quantity: 60,
		unitOfMeasure: "bunch",
		description: "Fresh organic spinach leaves. Rich in iron and vitamins. Perfect for salads, smoothies, and cooking.",
		images: ["https://picsum.photos/400/400?random=10", "https://picsum.photos/400/400?random=20"],
		category: "Vegetables",
		brand: "Green Farm",
		inStock: true,
		tags: ["spinach", "vegetables", "organic", "leafy"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "11",
		name: "Bananas",
		wholePrice: 2200.0,
		unitPrice: 120.0,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "Fresh ripe bananas. Sweet and nutritious. Rich in potassium and perfect for snacking or baking.",
		images: ["https://picsum.photos/400/400?random=21", "https://picsum.photos/400/400?random=31"],
		category: "Fruits",
		brand: "Tropical Fresh",
		inStock: true,
		tags: ["bananas", "fruits", "fresh", "tropical"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "12",
		name: "Chocolate Cookies",
		wholePrice: 2500.0,
		unitPrice: 150.0,
		quantity: 200,
		unitOfMeasure: "pack",
		description: "Delicious chocolate chip cookies. Freshly baked with premium chocolate. Perfect with tea or coffee.",
		images: ["https://picsum.photos/400/400?random=22", "https://picsum.photos/400/400?random=32"],
		category: "Bakery",
		brand: "Sweet Treats",
		inStock: true,
		tags: ["cookies", "bakery", "chocolate", "sweet"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "13",
		name: "Cheddar Cheese",
		wholePrice: 5500.0,
		unitPrice: 600.0,
		quantity: 80,
		unitOfMeasure: "kg",
		description: "Premium cheddar cheese. Aged for rich flavor. Perfect for sandwiches, burgers, and cooking.",
		images: ["https://picsum.photos/400/400?random=23", "https://picsum.photos/400/400?random=33"],
		category: "Dairy",
		brand: "Cheese Masters",
		inStock: true,
		tags: ["cheese", "dairy", "cheddar", "premium"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "14",
		name: "Mineral Water",
		wholePrice: 3000.0,
		unitPrice: 50.0,
		quantity: 500,
		unitOfMeasure: "bottle",
		description: "Pure natural mineral water. Sourced from protected springs. Refreshing and healthy.",
		images: ["https://picsum.photos/400/400?random=24", "https://picsum.photos/400/400?random=34"],
		category: "Beverages",
		brand: "Pure Springs",
		inStock: true,
		tags: ["water", "beverages", "mineral", "pure"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "15",
		name: "Peanuts - Roasted",
		wholePrice: 2800.0,
		unitPrice: 140.0,
		quantity: 150,
		unitOfMeasure: "pack",
		description: "Roasted salted peanuts. Crunchy and delicious. Perfect snack rich in protein.",
		images: ["https://picsum.photos/400/400?random=25", "https://picsum.photos/400/400?random=35"],
		category: "Snacks",
		brand: "Nutty Bites",
		inStock: true,
		tags: ["peanuts", "snacks", "roasted", "protein"],
		createdBy: "admin",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		_id: "16",
		name: "Dishwashing Liquid",
		wholePrice: 2400.0,
		unitPrice: 200.0,
		quantity: 120,
		unitOfMeasure: "liter",
		description: "Effective dishwashing liquid. Cuts through grease easily. Gentle on hands with lemon fresh scent.",
		images: ["https://picsum.photos/400/400?random=26", "https://picsum.photos/400/400?random=36"],
		category: "Household",
		brand: "Sparkle Clean",
		inStock: true,
		tags: ["dishwashing", "household", "cleaning", "liquid"],
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

			getProductById: (id) => {
				// First check in loaded products
				const { allProducts } = get();
				const productInStore = allProducts.products.find((product) => product._id === id);

				if (productInStore) {
					return productInStore;
				}

				// Fallback to mock data
				return mockProducts.find((product) => product._id === id);
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
