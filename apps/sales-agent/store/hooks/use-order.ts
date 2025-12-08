/**
 * Order Store Hooks
 * Custom hooks for accessing order state and actions
 */

import { useOrderStore } from '../slices/order/order-store';
import { Order, OrderStatus } from '../../types/order';
import { CartItem } from '../../types/product';

/**
 * Get entire order state
 */
export const useOrder = () => useOrderStore((state) => state);

/**
 * Get all orders
 */
export const useOrders = (): Order[] => useOrderStore((state) => state.orders);

/**
 * Get cart items
 */
export const useCart = (): CartItem[] => useOrderStore((state) => state.cart);

/**
 * Get selected order
 */
export const useSelectedOrder = (): Order | null => useOrderStore((state) => state.selectedOrder);

/**
 * Get order loading state
 */
export const useOrderLoading = (): boolean => useOrderStore((state) => state.isLoading);

/**
 * Get order error
 */
export const useOrderError = (): string | null => useOrderStore((state) => state.error);

/**
 * Get cart total
 */
export const useCartTotal = (): number => {
  const getCartTotal = useOrderStore((state) => state.getCartTotal);
  return getCartTotal();
};

/**
 * Get cart item count
 */
export const useCartItemCount = (): number => {
  const getCartItemCount = useOrderStore((state) => state.getCartItemCount);
  return getCartItemCount();
};

/**
 * Get cart actions
 */
export const useCartActions = () => ({
  addToCart: useOrderStore((state) => state.addToCart),
  removeFromCart: useOrderStore((state) => state.removeFromCart),
  updateQuantity: useOrderStore((state) => state.updateQuantity),
  clearCart: useOrderStore((state) => state.clearCart),
});

/**
 * Get order actions
 */
export const useOrderActions = () => ({
  fetchOrders: useOrderStore((state) => state.fetchOrders),
  fetchOrderById: useOrderStore((state) => state.fetchOrderById),
  placeOrder: useOrderStore((state) => state.placeOrder),
  setSelectedOrder: useOrderStore((state) => state.setSelectedOrder),
  refreshOrders: useOrderStore((state) => state.refreshOrders),
});

/**
 * Get offline orders
 */
export const useOfflineOrders = () => useOrderStore((state) => state.offlineOrders);

/**
 * Get offline order count
 */
export const useOfflineOrderCount = (): number => {
  const offlineOrders = useOrderStore((state) => state.offlineOrders);
  return offlineOrders.filter((o) => !o.synced).length;
};

/**
 * Get sync action
 */
export const useSyncOfflineOrders = () => useOrderStore((state) => state.syncOfflineOrders);

/**
 * Get orders by status
 */
export const useOrdersByStatus = (status: OrderStatus): Order[] => {
  const orders = useOrderStore((state) => state.orders);
  return orders.filter((o) => o.status === status);
};

/**
 * Get order counts by status
 */
export const useOrderCountsByStatus = () => {
  const orders = useOrderStore((state) => state.orders);

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    dispatched: orders.filter((o) => o.status === 'dispatched').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };
};

/**
 * Get today's orders
 */
export const useTodaysOrders = (): Order[] => {
  const orders = useOrderStore((state) => state.orders);
  const today = new Date().toISOString().split('T')[0];
  return orders.filter((o) => o.createdAt.split('T')[0] === today);
};

/**
 * Check if cart is empty
 */
export const useIsCartEmpty = (): boolean => {
  const cart = useOrderStore((state) => state.cart);
  return cart.length === 0;
};

/**
 * Get cart item by product ID
 */
export const useCartItem = (productId: string): CartItem | undefined => {
  const cart = useOrderStore((state) => state.cart);
  return cart.find((item) => item.product._id === productId);
};
