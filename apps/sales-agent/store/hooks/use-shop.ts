/**
 * Shop Store Hooks
 * Custom hooks for accessing shop state and actions
 */

import { useShopStore } from '../slices/shop/shop-store';
import { Shop, ShopStatus } from '../../types/shop';

/**
 * Get entire shop state
 */
export const useShop = () => useShopStore((state) => state);

/**
 * Get all shops
 */
export const useShops = (): Shop[] => useShopStore((state) => state.shops);

/**
 * Get filtered shops based on current filter
 */
export const useFilteredShops = (): Shop[] => {
  const getFilteredShops = useShopStore((state) => state.getFilteredShops);
  return getFilteredShops();
};

/**
 * Get selected shop
 */
export const useSelectedShop = (): Shop | null => useShopStore((state) => state.selectedShop);

/**
 * Get shop loading state
 */
export const useShopLoading = (): boolean => useShopStore((state) => state.isLoading);

/**
 * Get shop error
 */
export const useShopError = (): string | null => useShopStore((state) => state.error);

/**
 * Get filter status
 */
export const useShopFilter = (): ShopStatus | 'all' => useShopStore((state) => state.filterStatus);

/**
 * Get fetchShops action
 */
export const useFetchShops = () => useShopStore((state) => state.fetchShops);

/**
 * Get registerShop action
 */
export const useRegisterShop = () => useShopStore((state) => state.registerShop);

/**
 * Get setSelectedShop action
 */
export const useSetSelectedShop = () => useShopStore((state) => state.setSelectedShop);

/**
 * Get setFilterStatus action
 */
export const useSetShopFilter = () => useShopStore((state) => state.setFilterStatus);

/**
 * Get shops count by status
 */
export const useShopsCountByStatus = () => {
  const shops = useShopStore((state) => state.shops);

  return {
    total: shops.length,
    pending: shops.filter((s) => s.approvalStatus === 'pending').length,
    approved: shops.filter((s) => s.approvalStatus === 'approved').length,
    rejected: shops.filter((s) => s.approvalStatus === 'rejected').length,
  };
};

/**
 * Get approved shops only
 */
export const useApprovedShops = (): Shop[] => {
  const shops = useShopStore((state) => state.shops);
  return shops.filter((s) => s.approvalStatus === 'approved');
};

/**
 * Get pending shops only
 */
export const usePendingShops = (): Shop[] => {
  const shops = useShopStore((state) => state.shops);
  return shops.filter((s) => s.approvalStatus === 'pending');
};

/**
 * Get shop by ID
 */
export const useShopById = (shopId: string): Shop | undefined => {
  const shops = useShopStore((state) => state.shops);
  return shops.find((s) => s._id === shopId);
};
