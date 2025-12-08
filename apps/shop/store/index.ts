// store/index.ts - Complete final version with all exports
// Auth
export { useAuthStore } from "./slices/auth/auth-store";
export { useAuth } from "./hooks/use-auth";

// Theme
export { useThemeStore } from "./slices/theme/theme-store";
export { useThemeHook } from "./hooks/use-theme";

// Products
export { useProductsStore } from "./slices/products/products-store";
export { useProducts } from "./hooks/use-products";

// Cart
export { useCartStore } from "./slices/cart/cart-store";
export { useCart } from "./hooks/use-cart";

// Favorites
export { useFavoritesStore } from "./slices/favorites/favorites-store";
export { useFavorites } from "./hooks/use-favorites";

// Categories
export { useCategoriesStore } from "./slices/categories/categories-store";
export { useCategories } from "./hooks/use-categories";

// Types
export type { User, LoginFormData, RegisterFormData, AuthState } from "./types/user";
export type { Product, Category, FetchProductsParams } from "./types/product";
export type { CartItem, CartSummary } from "./types/cart";
export type { Pagination, BaseState, ApiResponse } from "./types/common";