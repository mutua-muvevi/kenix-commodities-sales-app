// store/slices/cart/cart-store.ts - Complete cart store
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { CartItem } from "../../types/cart";
import { Product } from "../../types/product";
import { secureStorage } from "../../middleware/persist";

interface CartState {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
	isLoading: boolean;
	error: string | null;

	// Actions
	addItem: (product: Product, quantity: number) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	getItemQuantity: (productId: string) => number;
	getItemById: (productId: string) => CartItem | undefined;
	resetError: () => void;
}

const calculateTotals = (items: CartItem[]) => {
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
	return { totalItems, totalPrice };
};

export const useCartStore = create<CartState>()(
	devtools(
		persist(
			(set, get) => ({
				items: [],
				totalItems: 0,
				totalPrice: 0,
				isLoading: false,
				error: null,

				addItem: (product, quantity) => {
					const { items } = get();
					const existingItem = items.find((item) => item.productId === product._id);

					let newItems: CartItem[];

					if (existingItem) {
						// Update existing item
						newItems = items.map((item) =>
							item.productId === product._id ? { ...item, quantity: item.quantity + quantity } : item,
						);
					} else {
						// Add new item
						const newItem: CartItem = {
							productId: product._id,
							name: product.name,
							unitPrice: product.unitPrice,
							wholePrice: product.wholePrice,
							quantity,
							unitOfMeasure: product.unitOfMeasure,
							image: product.images?.[0],
							inStock: product.inStock,
						};
						newItems = [...items, newItem];
					}

					const { totalItems, totalPrice } = calculateTotals(newItems);
					set({ items: newItems, totalItems, totalPrice });
				},

				removeItem: (productId) => {
					const { items } = get();
					const newItems = items.filter((item) => item.productId !== productId);
					const { totalItems, totalPrice } = calculateTotals(newItems);
					set({ items: newItems, totalItems, totalPrice });
				},

				updateQuantity: (productId, quantity) => {
					if (quantity <= 0) {
						get().removeItem(productId);
						return;
					}

					const { items } = get();
					const newItems = items.map((item) => (item.productId === productId ? { ...item, quantity } : item));
					const { totalItems, totalPrice } = calculateTotals(newItems);
					set({ items: newItems, totalItems, totalPrice });
				},

				clearCart: () => {
					set({ items: [], totalItems: 0, totalPrice: 0 });
				},

				getItemQuantity: (productId) => {
					const { items } = get();
					const item = items.find((item) => item.productId === productId);
					return item?.quantity || 0;
				},

				getItemById: (productId) => {
					const { items } = get();
					return items.find((item) => item.productId === productId);
				},

				resetError: () => set({ error: null }),
			}),
			{
				name: "shop-cart-store",
				storage: createJSONStorage(() => secureStorage),
				partialize: (state) => ({
					items: state.items,
					totalItems: state.totalItems,
					totalPrice: state.totalPrice,
				}),
			},
		),
		{ name: "cart-store" },
	),
);
