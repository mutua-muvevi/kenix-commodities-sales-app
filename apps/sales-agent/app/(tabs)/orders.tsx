import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import apiService from '../../services/api';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  imageUrl?: string;
  isInStock: boolean;
  stockQuantity?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type ViewMode = 'history' | 'create';

export default function OrdersScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { shops, fetchShops } = useShopStore();

  const [viewMode, setViewMode] = useState<ViewMode>('history');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create order state
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [showShopSelector, setShowShopSelector] = useState(false);
  const [showProductCatalog, setShowProductCatalog] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadOrders();
      loadShops();
    }
  }, [user]);

  useEffect(() => {
    if (params.shopId && shops.length > 0) {
      const shop = shops.find((s) => s._id === params.shopId);
      if (shop) {
        setSelectedShop(shop);
        setViewMode('create');
        loadProducts();
      }
    }
  }, [params.shopId, shops]);

  const loadShops = async () => {
    if (!user?._id) return;
    await fetchShops(user._id, 'approved');
  };

  const loadOrders = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      const data = await apiService.getMyOrders(user._id);
      setOrders(data.orders || data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProducts({ isInStock: true });
      setProducts(data.products || data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Could not load products');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleSelectShop = (shop: any) => {
    setSelectedShop(shop);
    setShowShopSelector(false);
    loadProducts();
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product._id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.wholesalePrice || item.product.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedShop) {
      Alert.alert('Error', 'Please select a shop');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Please add products to cart');
      return;
    }

    try {
      setIsLoading(true);

      const orderData = {
        orderer: selectedShop._id,
        products: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        createdBy: user?._id,
        deliveryAddress: selectedShop.address || {},
        deliveryNotes: deliveryNotes.trim() || undefined,
      };

      await apiService.createOrder(orderData);

      Alert.alert(
        'Success!',
        'Order placed successfully and is pending admin approval.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCart([]);
              setDeliveryNotes('');
              setSelectedShop(null);
              setViewMode('history');
              loadOrders();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.message || error.message || 'Could not place order'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { bg: '#fef3c7', color: '#f59e0b', text: 'Pending' },
      approved: { bg: '#dbeafe', color: '#3b82f6', text: 'Approved' },
      processing: { bg: '#e0e7ff', color: '#6366f1', text: 'Processing' },
      shipped: { bg: '#ddd6fe', color: '#8b5cf6', text: 'Shipped' },
      delivered: { bg: '#dcfce7', color: '#22c55e', text: 'Delivered' },
      cancelled: { bg: '#fee2e2', color: '#ef4444', text: 'Cancelled' },
    };
    return badges[status] || badges.pending;
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategories = () => {
    const categories = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(categories)];
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.orderNumber || item._id.slice(-6)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <View style={styles.orderCardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="storefront" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {item.orderer?.shopName || item.orderer?.name || 'Unknown Shop'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cube" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {item.products?.length || 0} items
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={16} color="#6b7280" />
            <Text style={styles.orderTotal}>{formatCurrency(item.totalPrice || 0)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const cartItem = cart.find((ci) => ci.product._id === item._id);
    const quantity = cartItem?.quantity || 0;

    return (
      <View style={styles.productCard}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>
            {formatCurrency(item.wholesalePrice || item.price)}
          </Text>
        </View>
        <View style={styles.productActions}>
          {quantity === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(item._id, -1)}
              >
                <Ionicons name="remove" size={16} color="#22c55e" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(item._id, 1)}
              >
                <Ionicons name="add" size={16} color="#22c55e" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderCreateOrder = () => (
    <View style={styles.createOrderContainer}>
      {/* Shop Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Shop</Text>
        {selectedShop ? (
          <TouchableOpacity
            style={styles.selectedShopCard}
            onPress={() => setShowShopSelector(true)}
          >
            <View>
              <Text style={styles.selectedShopName}>{selectedShop.shopName}</Text>
              <Text style={styles.selectedShopOwner}>{selectedShop.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={24} color="#6b7280" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.selectShopButton}
            onPress={() => setShowShopSelector(true)}
          >
            <Ionicons name="storefront-outline" size={24} color="#22c55e" />
            <Text style={styles.selectShopButtonText}>Select Shop</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedShop && (
        <>
          {/* Product Catalog */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add Products</Text>
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()} items</Text>
                </View>
              )}
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {getCategories().map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={getFilteredProducts()}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              style={styles.productList}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <View style={styles.cartSummary}>
              <View style={styles.cartSummaryHeader}>
                <Text style={styles.cartSummaryTitle}>Order Summary</Text>
                <TouchableOpacity onPress={() => setCart([])}>
                  <Text style={styles.clearCartText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {cart.map((item) => (
                <View key={item.product._id} style={styles.cartItem}>
                  <Text style={styles.cartItemName}>
                    {item.product.name} x {item.quantity}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    {formatCurrency((item.product.wholesalePrice || item.product.price) * item.quantity)}
                  </Text>
                </View>
              ))}

              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total Amount</Text>
                <Text style={styles.cartTotalValue}>{formatCurrency(getCartTotal())}</Text>
              </View>

              <TextInput
                style={styles.notesInput}
                placeholder="Delivery notes (optional)..."
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmitOrder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Shop Selector Modal */}
      <Modal visible={showShopSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Shop</Text>
              <TouchableOpacity onPress={() => setShowShopSelector(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={shops.filter((s) => s.approvalStatus === 'approved')}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.shopOption}
                  onPress={() => handleSelectShop(item)}
                >
                  <View>
                    <Text style={styles.shopOptionName}>{item.shopName}</Text>
                    <Text style={styles.shopOptionOwner}>{item.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'history' && styles.toggleButtonActive]}
          onPress={() => setViewMode('history')}
        >
          <Text style={[styles.toggleText, viewMode === 'history' && styles.toggleTextActive]}>
            Order History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'create' && styles.toggleButtonActive]}
          onPress={() => setViewMode('create')}
        >
          <Text style={[styles.toggleText, viewMode === 'create' && styles.toggleTextActive]}>
            Create Order
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'history' ? (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>Start by creating your first order</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setViewMode('create')}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Create Order</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        renderCreateOrder()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    margin: 16,
    borderRadius: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#22c55e',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  createOrderContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cartBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  selectedShopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  selectedShopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  selectedShopOwner: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  selectShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
  },
  selectShopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#22c55e',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  productList: {
    maxHeight: 300,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  productCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 4,
  },
  productActions: {
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#22c55e',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 12,
  },
  cartSummary: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearCartText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cartItemName: {
    fontSize: 14,
    color: '#4b5563',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 14,
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  shopOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  shopOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  shopOptionOwner: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
