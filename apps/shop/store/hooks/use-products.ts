// store/hooks/use-products.ts - Complete products hook
import { useProductsStore } from "../slices/products/products-store";

export const useProducts = () => {
	const { allProducts, isLoadingProducts, error, fetchAllProducts, clearProducts, resetError } = useProductsStore();

	return {
		allProducts,
		isLoadingProducts,
		error,
		fetchAllProducts,
		clearProducts,
		resetError,
		// Computed values
		hasProducts: allProducts.products.length > 0,
		productCount: allProducts.products.length,
	};
};
