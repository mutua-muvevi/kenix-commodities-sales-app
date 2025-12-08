// store/hooks/use-cart.ts - Complete cart hook
import { useCartStore } from "../slices/cart/cart-store";

export const useCart = () => {
	const {
		items,
		totalItems,
		totalPrice,
		isLoading,
		error,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		getItemQuantity,
		getItemById,
		resetError,
	} = useCartStore();

	return {
		items,
		totalItems,
		totalPrice,
		isLoading,
		error,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		getItemQuantity,
		getItemById,
		resetError,
		// Computed values
		hasItems: items.length > 0,
		isEmpty: items.length === 0,
		itemCount: items.length,
		averageItemPrice: items.length > 0 ? totalPrice / totalItems : 0,
	};
};
