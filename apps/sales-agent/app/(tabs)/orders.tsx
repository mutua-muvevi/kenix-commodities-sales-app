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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { useOrderStore } from '../../store/slices/order/order-store';
import { useCategoriesStore } from '../../store';
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

interface CreditInfo {
  creditLimit: number;
  creditUsed: number;
  availableCredit: number;
}

type ViewMode = 'history' | 'create';
type OrderFilter = 'all' | 'on_behalf' | 'direct';

export default function OrdersScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { shops, fetchShops } = useShopStore();
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategoriesStore();

  const orderStore = useOrderStore();

  const [viewMode, setViewMode] = useState<ViewMode>('history');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
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

  // On-behalf order specific state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [notifyShopOwner, setNotifyShopOwner] = useState(true);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Modals
  const [showShopSelector, setShowShopSelector] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadOrders();
      loadShops();
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      await fetchCategories({ isActive: true });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    if (params.shopId && shops.length > 0) {
      const shop = shops.find((s) => s._id === params.shopId);
      if (shop) {
        handleSelectShop(shop);
        setViewMode('create');
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

  const loadShopCreditInfo = async (shopId: string) => {
    try {
      const data = await apiService.getShopCreditInfo(shopId);
      setCreditInfo(data);
    } catch (error) {
      console.error('Error loading credit info:', error);
    }
  };

  const loadShopRecentOrders = async (shopId: string) => {
    try {
      const data = await apiService.getShopRecentOrders(shopId, 5);
      setRecentOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleSelectShop = async (shop: any) => {
    setSelectedShop(shop);
    setShowShopSelector(false);
    loadProducts();
    loadShopCreditInfo(shop._id);
    loadShopRecentOrders(shop._id);
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

  const calculateCommission = () => {
    return getCartTotal() * 0.05; // 5% commission
  };

  const validateCreditOrder = () => {
    if (paymentMethod !== 'credit') return true;

    if (!creditInfo) {
      Alert.alert('Error', 'Could not load credit information');
      return false;
    }

    const orderTotal = getCartTotal();
    if (orderTotal > creditInfo.availableCredit) {
      Alert.alert(
        'Insufficient Credit',
        `This order (KES ${formatCurrency(orderTotal)}) exceeds the available credit limit (KES ${formatCurrency(creditInfo.availableCredit)}).\n\nCredit Limit: KES ${formatCurrency(creditInfo.creditLimit)}\nCredit Used: KES ${formatCurrency(creditInfo.creditUsed)}\nAvailable: KES ${formatCurrency(creditInfo.availableCredit)}`,
        [
          { text: 'Change Payment Method', onPress: () => setShowPaymentSelector(true) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return false;
    }

    // Warning if order uses more than 80% of available credit
    if (orderTotal > creditInfo.availableCredit * 0.8) {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'High Credit Usage',
          `This order will use ${((orderTotal / creditInfo.availableCredit) * 100).toFixed(0)}% of the available credit. Do you want to proceed?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Proceed', onPress: () => resolve(true) },
          ]
        );
      });
    }

    return true;
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

    // Validate credit if credit payment method
    const isValid = await validateCreditOrder();
    if (!isValid) return;

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
        paymentMethod,
        placedOnBehalf: true,
        notifyShopOwner,
      };

      const response = await apiService.createOrder(orderData);

      // Send notification if requested
      if (notifyShopOwner) {
        await apiService.notifyShopOwner(
          selectedShop._id,
          response.order?._id || response._id,
          getCartTotal(),
          user?.name || 'Sales Agent'
        );
      }

      const commission = calculateCommission();

      Alert.alert(
        'Order Placed Successfully!',
        `Order has been placed on behalf of ${selectedShop.shopName}.\n\n` +
        `Order Total: KES ${formatCurrency(getCartTotal())}\n` +
        `Payment Method: ${paymentMethod.toUpperCase()}\n` +
        `Your Commission: KES ${formatCurrency(commission)}\n\n` +
        `Order is pending admin approval.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCart([]);
              setDeliveryNotes('');
              setSelectedShop(null);
              setPaymentMethod('cash');
              setNotifyShopOwner(true);
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

  const handleReorder = (order: any) => {
    setShowRecentOrders(false);

    // Populate cart with previous order items
    const orderProducts = order.products || [];
    const newCart: CartItem[] = [];

    orderProducts.forEach((orderProduct: any) => {
      const product = products.find(p => p._id === orderProduct.product?._id || p._id === orderProduct.product);
      if (product) {
        newCart.push({
          product,
          quantity: orderProduct.quantity,
        });
      }
    });

    if (newCart.length > 0) {
      setCart(newCart);
      Alert.alert('Success', 'Previous order items added to cart. You can modify quantities before placing the order.');
    } else {
      Alert.alert('Info', 'Could not load previous order items. Some products may be unavailable.');
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
    return amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategories = () => {
    if (categories.length > 0) {
      return ['all', ...categories.map((cat) => cat._id)];
    }
    const productCategories = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(productCategories)];
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'all') return 'All';
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) return category.name;
    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
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

  const getFilteredOrders = () => {
    if (orderFilter === 'all') return orders;
    if (orderFilter === 'on_behalf') {
      return orders.filter(o => o.placedOnBehalf === true);
    }
    return orders.filter(o => !o.placedOnBehalf);
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status);
    const isOnBehalf = item.placedOnBehalf === true;

    return (
      <View style={styles.orderCard}>
        {/* On Behalf Badge */}
        {isOnBehalf && (
          <View style={styles.onBehalfBanner}>
            <Ionicons name="business" size={14} color="#fff" />
            <Text style={styles.onBehalfBannerText}>Placed on behalf of shop</Text>
          </View>
        )}

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
            <Ionicons name="card" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {(item.paymentMethod || 'cash').toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={16} color="#6b7280" />
            <Text style={styles.orderTotal}>KES {formatCurrency(item.totalPrice || 0)}</Text>
          </View>

          {isOnBehalf && item.agentCommission && (
            <View style={[styles.infoRow, styles.commissionRow]}>
              <Ionicons name="wallet" size={16} color="#22c55e" />
              <Text style={styles.commissionText}>
                Your Commission: KES {formatCurrency(item.agentCommission)}
              </Text>
            </View>
          )}
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
            KES {formatCurrency(item.wholesalePrice || item.price)}
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
    <ScrollView style={styles.createOrderContainer} showsVerticalScrollIndicator={false}>
      {/* Shop Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Step 1: Select Shop
        </Text>
        {selectedShop ? (
          <View>
            <View style={styles.orderingForBanner}>
              <Ionicons name="storefront" size={20} color="#22c55e" />
              <Text style={styles.orderingForText}>Ordering for: </Text>
              <Text style={styles.orderingForShop}>{selectedShop.shopName}</Text>
            </View>

            <TouchableOpacity
              style={styles.selectedShopCard}
              onPress={() => setShowShopSelector(true)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedShopName}>{selectedShop.shopName}</Text>
                <Text style={styles.selectedShopOwner}>{selectedShop.name}</Text>
                {selectedShop.address?.area && (
                  <Text style={styles.selectedShopAddress}>{selectedShop.address.area}</Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={24} color="#6b7280" />
            </TouchableOpacity>

            {/* Credit Info if credit payment */}
            {paymentMethod === 'credit' && creditInfo && (
              <View style={styles.creditInfoCard}>
                <Text style={styles.creditInfoTitle}>Credit Information</Text>
                <View style={styles.creditInfoRow}>
                  <Text style={styles.creditInfoLabel}>Credit Limit:</Text>
                  <Text style={styles.creditInfoValue}>KES {formatCurrency(creditInfo.creditLimit)}</Text>
                </View>
                <View style={styles.creditInfoRow}>
                  <Text style={styles.creditInfoLabel}>Used:</Text>
                  <Text style={styles.creditInfoValue}>KES {formatCurrency(creditInfo.creditUsed)}</Text>
                </View>
                <View style={styles.creditInfoRow}>
                  <Text style={styles.creditInfoLabel}>Available:</Text>
                  <Text style={[styles.creditInfoValue, styles.creditAvailable]}>
                    KES {formatCurrency(creditInfo.availableCredit)}
                  </Text>
                </View>
              </View>
            )}

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <TouchableOpacity
                style={styles.recentOrdersButton}
                onPress={() => setShowRecentOrders(true)}
              >
                <Ionicons name="time" size={20} color="#3b82f6" />
                <Text style={styles.recentOrdersButtonText}>
                  View Recent Orders (Quick Reorder)
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
          {/* Payment Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 2: Payment Method</Text>
            <TouchableOpacity
              style={styles.paymentMethodSelector}
              onPress={() => setShowPaymentSelector(true)}
            >
              <View style={styles.paymentMethodInfo}>
                <Ionicons
                  name={
                    paymentMethod === 'cash'
                      ? 'cash'
                      : paymentMethod === 'mpesa'
                      ? 'phone-portrait'
                      : 'card'
                  }
                  size={24}
                  color="#22c55e"
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.paymentMethodLabel}>Payment Method</Text>
                  <Text style={styles.paymentMethodValue}>{paymentMethod.toUpperCase()}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* Notify Shop Owner Toggle */}
            <View style={styles.notifyToggleContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifyToggleLabel}>Notify Shop Owner</Text>
                <Text style={styles.notifyToggleDesc}>
                  Send push notification and SMS about this order
                </Text>
              </View>
              <Switch
                value={notifyShopOwner}
                onValueChange={setNotifyShopOwner}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifyShopOwner ? '#22c55e' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Product Catalog */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Step 3: Add Products</Text>
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

            {isCategoriesLoading ? (
              <View style={styles.categoryLoadingContainer}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.categoryLoadingText}>Loading categories...</Text>
              </View>
            ) : (
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
                      {getCategoryName(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

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
                <Text style={styles.cartSummaryTitle}>Step 4: Review & Confirm</Text>
                <TouchableOpacity onPress={() => setCart([])}>
                  <Text style={styles.clearCartText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {/* Shop Info Banner */}
              <View style={styles.confirmBanner}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.confirmBannerText}>
                  This order will be placed on behalf of {selectedShop.shopName}
                </Text>
              </View>

              {/* Cart Items */}
              {cart.map((item) => (
                <View key={item.product._id} style={styles.cartItem}>
                  <Text style={styles.cartItemName}>
                    {item.product.name} x {item.quantity}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    KES {formatCurrency((item.product.wholesalePrice || item.product.price) * item.quantity)}
                  </Text>
                </View>
              ))}

              {/* Order Summary */}
              <View style={styles.orderSummaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>KES {formatCurrency(getCartTotal())}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment Method:</Text>
                  <Text style={styles.summaryValue}>{paymentMethod.toUpperCase()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Your Commission (5%):</Text>
                  <Text style={[styles.summaryValue, styles.commissionValue]}>
                    KES {formatCurrency(calculateCommission())}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.cartTotalLabel}>Total Amount:</Text>
                  <Text style={styles.cartTotalValue}>KES {formatCurrency(getCartTotal())}</Text>
                </View>
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
                    <Text style={styles.submitButtonText}>
                      Place Order on Behalf of {selectedShop.shopName}
                    </Text>
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
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shopOptionName}>{item.shopName}</Text>
                    <Text style={styles.shopOptionOwner}>{item.name}</Text>
                    {item.address?.area && (
                      <Text style={styles.shopOptionAddress}>{item.address.area}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <View style={styles.emptyModalContainer}>
                  <Text style={styles.emptyModalText}>No approved shops found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal visible={showPaymentSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentSelector(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                onPress={() => {
                  setPaymentMethod('cash');
                  setShowPaymentSelector(false);
                }}
              >
                <Ionicons name="cash" size={24} color={paymentMethod === 'cash' ? '#22c55e' : '#6b7280'} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.paymentOptionTitle}>Cash</Text>
                  <Text style={styles.paymentOptionDesc}>Pay with cash on delivery</Text>
                </View>
                {paymentMethod === 'cash' && (
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'mpesa' && styles.paymentOptionActive]}
                onPress={() => {
                  setPaymentMethod('mpesa');
                  setShowPaymentSelector(false);
                }}
              >
                <Ionicons name="phone-portrait" size={24} color={paymentMethod === 'mpesa' ? '#22c55e' : '#6b7280'} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.paymentOptionTitle}>M-Pesa</Text>
                  <Text style={styles.paymentOptionDesc}>Mobile money payment</Text>
                </View>
                {paymentMethod === 'mpesa' && (
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionActive]}
                onPress={() => {
                  setPaymentMethod('credit');
                  setShowPaymentSelector(false);
                }}
              >
                <Ionicons name="card" size={24} color={paymentMethod === 'credit' ? '#22c55e' : '#6b7280'} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.paymentOptionTitle}>Credit</Text>
                  <Text style={styles.paymentOptionDesc}>Shop credit account</Text>
                </View>
                {paymentMethod === 'credit' && (
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recent Orders Modal */}
      <Modal visible={showRecentOrders} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recent Orders - Quick Reorder</Text>
              <TouchableOpacity onPress={() => setShowRecentOrders(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentOrders}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentOrderItem}
                  onPress={() => handleReorder(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentOrderDate}>{formatDate(item.createdAt)}</Text>
                    <Text style={styles.recentOrderItems}>
                      {item.products?.length || 0} items
                    </Text>
                    <Text style={styles.recentOrderTotal}>
                      KES {formatCurrency(item.totalPrice || 0)}
                    </Text>
                  </View>
                  <View style={styles.reorderButton}>
                    <Ionicons name="reload" size={20} color="#22c55e" />
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
        <>
          {/* Order Filter */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, orderFilter === 'all' && styles.filterChipActive]}
                onPress={() => setOrderFilter('all')}
              >
                <Text style={[styles.filterChipText, orderFilter === 'all' && styles.filterChipTextActive]}>
                  All Orders
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, orderFilter === 'on_behalf' && styles.filterChipActive]}
                onPress={() => setOrderFilter('on_behalf')}
              >
                <Text style={[styles.filterChipText, orderFilter === 'on_behalf' && styles.filterChipTextActive]}>
                  Orders for Shops
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, orderFilter === 'direct' && styles.filterChipActive]}
                onPress={() => setOrderFilter('direct')}
              >
                <Text style={[styles.filterChipText, orderFilter === 'direct' && styles.filterChipTextActive]}>
                  My Direct Orders
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <FlatList
            data={getFilteredOrders()}
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
        </>
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
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
    overflow: 'hidden',
  },
  onBehalfBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 8,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    gap: 6,
  },
  onBehalfBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
  commissionRow: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  commissionText: {
    fontSize: 14,
    fontWeight: '600',
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
  orderingForBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderingForText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
  },
  orderingForShop: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
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
  selectedShopAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
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
  creditInfoCard: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  creditInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  creditInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  creditInfoLabel: {
    fontSize: 13,
    color: '#3b82f6',
  },
  creditInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  creditAvailable: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  recentOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  recentOrdersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  paymentMethodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentMethodValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  notifyToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  notifyToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  notifyToggleDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
  categoryLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  categoryLoadingText: {
    fontSize: 14,
    color: '#6b7280',
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
    marginBottom: 16,
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
  confirmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  confirmBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '500',
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
  orderSummaryBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  commissionValue: {
    color: '#22c55e',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 6,
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
  shopOptionAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentOptionDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  recentOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recentOrderDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  recentOrderItems: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  recentOrderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
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
  emptyModalContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
