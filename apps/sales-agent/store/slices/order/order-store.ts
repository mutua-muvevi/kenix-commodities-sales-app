/**
 * Order Store Slice
 * Manages order data, cart operations, and order placement
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderFormData, OrderStatus, OfflineOrder } from '../../../types/order';
import { Product, CartItem } from '../../../types/product';
import { asyncStorage } from '../../middleware/persist';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface OrderState {
  // State
  orders: Order[];
  cart: CartItem[];
  selectedOrder: Order | null;
  selectedShop: any | null;
  offlineOrders: OfflineOrder[];
  isLoading: boolean;
  error: string | null;
  isOnBehalfOrder: boolean;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  notifyShopOwner: boolean;

  // Cart Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Order Actions
  fetchOrders: (agentId: string, status?: OrderStatus) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order>;
  placeOrder: (orderData: OrderFormData) => Promise<Order>;
  placeOrderOnBehalf: (shopId: string, orderData: Partial<OrderFormData>) => Promise<Order>;
  queueOfflineOrder: (orderData: OrderFormData) => void;
  syncOfflineOrders: () => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
  setSelectedShop: (shop: any | null) => void;
  setPaymentMethod: (method: 'cash' | 'mpesa' | 'credit') => void;
  setNotifyShopOwner: (notify: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  calculateCommission: (orderTotal: number) => number;
  getOnBehalfOrders: () => Order[];
  getMyDirectOrders: () => Order[];
  clearError: () => void;
  refreshOrders: (agentId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      // Initial State
      orders: [],
      cart: [],
      selectedOrder: null,
      selectedShop: null,
      offlineOrders: [],
      isLoading: false,
      error: null,
      isOnBehalfOrder: true, // Default to on-behalf for sales agents
      paymentMethod: 'cash',
      notifyShopOwner: true,

      // Add to Cart
      addToCart: (product: Product, quantity: number) => {
        actionLogger('OrderStore', 'addToCart', { productId: product._id, quantity });

        const { cart } = get();
        const existingItem = cart.find((item) => item.product._id === product._id);

        let updatedCart: CartItem[];

        if (existingItem) {
          // Update quantity
          updatedCart = cart.map((item) =>
            item.product._id === product._id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.product.wholePrice,
                }
              : item
          );
        } else {
          // Add new item
          updatedCart = [
            ...cart,
            {
              product,
              quantity,
              subtotal: quantity * product.wholePrice,
            },
          ];
        }

        set({ cart: updatedCart });
      },

      // Remove from Cart
      removeFromCart: (productId: string) => {
        actionLogger('OrderStore', 'removeFromCart', productId);
        const { cart } = get();
        set({ cart: cart.filter((item) => item.product._id !== productId) });
      },

      // Update Quantity
      updateQuantity: (productId: string, quantity: number) => {
        actionLogger('OrderStore', 'updateQuantity', { productId, quantity });

        const { cart } = get();

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const updatedCart = cart.map((item) =>
          item.product._id === productId
            ? {
                ...item,
                quantity,
                subtotal: quantity * item.product.wholePrice,
              }
            : item
        );

        set({ cart: updatedCart });
      },

      // Clear Cart
      clearCart: () => {
        actionLogger('OrderStore', 'clearCart');
        set({ cart: [] });
      },

      // Get Cart Total
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.subtotal, 0);
      },

      // Get Cart Item Count
      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Fetch Orders
      fetchOrders: async (agentId: string, status?: OrderStatus) => {
        actionLogger('OrderStore', 'fetchOrders', { agentId, status });
        try {
          set({ isLoading: true, error: null });

          const orders = await apiService.getOrders(agentId, status);

          set({
            orders,
            isLoading: false,
            error: null,
          });

          actionLogger('OrderStore', 'fetchOrders', `Loaded ${orders.length} orders`);
        } catch (error: any) {
          errorLogger('OrderStore', 'fetchOrders', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch orders',
            isLoading: false,
          });
          throw error;
        }
      },

      // Fetch Order By ID
      fetchOrderById: async (orderId: string) => {
        actionLogger('OrderStore', 'fetchOrderById', orderId);
        try {
          set({ isLoading: true, error: null });

          const order = await apiService.getOrderById(orderId);

          // Update order in list if exists
          const { orders } = get();
          const updatedOrders = orders.map((o) => (o._id === orderId ? order : o));

          set({
            orders: updatedOrders,
            selectedOrder: order,
            isLoading: false,
            error: null,
          });

          actionLogger('OrderStore', 'fetchOrderById', 'Success');
          return order;
        } catch (error: any) {
          errorLogger('OrderStore', 'fetchOrderById', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch order',
            isLoading: false,
          });
          throw error;
        }
      },

      // Place Order
      placeOrder: async (orderData: OrderFormData) => {
        actionLogger('OrderStore', 'placeOrder', orderData);
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.placeOrder(orderData);
          const newOrder = response.order || response;

          // Add to orders list
          const { orders } = get();
          set({
            orders: [newOrder, ...orders],
            cart: [], // Clear cart after successful order
            isLoading: false,
            error: null,
          });

          actionLogger('OrderStore', 'placeOrder', 'Success');
          return newOrder;
        } catch (error: any) {
          errorLogger('OrderStore', 'placeOrder', error);

          // If offline, queue order
          if (!navigator.onLine) {
            get().queueOfflineOrder(orderData);
            throw new Error('No internet connection. Order queued for sync.');
          }

          set({
            error: error.response?.data?.message || error.message || 'Failed to place order',
            isLoading: false,
          });
          throw error;
        }
      },

      // Queue Offline Order
      queueOfflineOrder: (orderData: OrderFormData) => {
        actionLogger('OrderStore', 'queueOfflineOrder', orderData);

        const { offlineOrders } = get();
        const offlineOrder: OfflineOrder = {
          localId: `offline-${Date.now()}`,
          orderData,
          createdAt: new Date().toISOString(),
          synced: false,
          syncAttempts: 0,
        };

        set({
          offlineOrders: [...offlineOrders, offlineOrder],
        });
      },

      // Sync Offline Orders
      syncOfflineOrders: async () => {
        actionLogger('OrderStore', 'syncOfflineOrders');

        const { offlineOrders } = get();
        const unsyncedOrders = offlineOrders.filter((order) => !order.synced);

        if (unsyncedOrders.length === 0) {
          actionLogger('OrderStore', 'syncOfflineOrders', 'No orders to sync');
          return;
        }

        for (const offlineOrder of unsyncedOrders) {
          try {
            const response = await apiService.placeOrder(offlineOrder.orderData);
            const newOrder = response.order || response;

            // Mark as synced
            const updatedOfflineOrders = get().offlineOrders.map((order) =>
              order.localId === offlineOrder.localId
                ? { ...order, synced: true }
                : order
            );

            // Add to orders list
            const { orders } = get();

            set({
              orders: [newOrder, ...orders],
              offlineOrders: updatedOfflineOrders,
            });

            actionLogger('OrderStore', 'syncOfflineOrders', `Synced order ${offlineOrder.localId}`);
          } catch (error: any) {
            errorLogger('OrderStore', 'syncOfflineOrders', error);

            // Increment sync attempts
            const updatedOfflineOrders = get().offlineOrders.map((order) =>
              order.localId === offlineOrder.localId
                ? {
                    ...order,
                    syncAttempts: order.syncAttempts + 1,
                    lastSyncAttempt: new Date().toISOString(),
                    error: error.message,
                  }
                : order
            );

            set({ offlineOrders: updatedOfflineOrders });
          }
        }
      },

      // Set Selected Order
      setSelectedOrder: (order: Order | null) => {
        actionLogger('OrderStore', 'setSelectedOrder', order?._id);
        set({ selectedOrder: order });
      },

      // Update Order Status
      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        actionLogger('OrderStore', 'updateOrderStatus', { orderId, status });

        const { orders, selectedOrder } = get();

        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        );

        set({
          orders: updatedOrders,
          selectedOrder:
            selectedOrder?._id === orderId ? { ...selectedOrder, status } : selectedOrder,
        });
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Refresh Orders
      refreshOrders: async (agentId: string) => {
        actionLogger('OrderStore', 'refreshOrders', agentId);
        await get().fetchOrders(agentId);
      },

      // Place Order On Behalf
      placeOrderOnBehalf: async (shopId: string, orderData: Partial<OrderFormData>) => {
        actionLogger('OrderStore', 'placeOrderOnBehalf', { shopId, orderData });

        const { paymentMethod, notifyShopOwner } = get();

        const completeOrderData: OrderFormData = {
          shopId,
          products: orderData.products || [],
          paymentMethod,
          deliveryAddress: orderData.deliveryAddress,
          deliveryNotes: orderData.deliveryNotes,
          specialInstructions: orderData.specialInstructions,
          placedOnBehalf: true,
          notifyShopOwner,
          commissionRate: 0.05, // 5% commission
        };

        return get().placeOrder(completeOrderData);
      },

      // Set Selected Shop
      setSelectedShop: (shop: any | null) => {
        actionLogger('OrderStore', 'setSelectedShop', shop?._id);
        set({ selectedShop: shop });
      },

      // Set Payment Method
      setPaymentMethod: (method: 'cash' | 'mpesa' | 'credit') => {
        actionLogger('OrderStore', 'setPaymentMethod', method);
        set({ paymentMethod: method });
      },

      // Set Notify Shop Owner
      setNotifyShopOwner: (notify: boolean) => {
        actionLogger('OrderStore', 'setNotifyShopOwner', notify);
        set({ notifyShopOwner: notify });
      },

      // Calculate Commission
      calculateCommission: (orderTotal: number) => {
        const commissionRate = 0.05; // 5%
        return orderTotal * commissionRate;
      },

      // Get On Behalf Orders
      getOnBehalfOrders: () => {
        const { orders } = get();
        return orders.filter((order) => order.placedOnBehalf === true);
      },

      // Get My Direct Orders
      getMyDirectOrders: () => {
        const { orders } = get();
        return orders.filter((order) => !order.placedOnBehalf);
      },
    }),
    {
      name: 'sales-agent-orders',
      storage: asyncStorage,
      partialize: (state) => ({
        cart: state.cart,
        offlineOrders: state.offlineOrders,
      }),
    }
  )
);
