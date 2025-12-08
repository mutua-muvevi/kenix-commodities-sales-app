/**
 * Product Type Definitions
 * Defines types for products, inventory, and cart operations
 */

export interface Product {
  _id: string;
  name: string;
  description?: string;
  wholePrice: number;
  unitPrice: number;
  quantity: number;
  unitOfMeasure: string;
  images?: string[];
  category: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  inStock: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  discount?: ProductDiscount;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  minQuantity?: number;
  validUntil?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountApplied?: number;
  finalPrice: number;
}

export interface ProductCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface InventoryStatus {
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  inStock: boolean;
  restockDate?: string;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface PriceHistory {
  productId: string;
  prices: {
    date: string;
    wholePrice: number;
    unitPrice: number;
  }[];
}

export interface ProductRecommendation {
  product: Product;
  reason: 'popular' | 'frequently_bought_together' | 'shop_preference' | 'seasonal' | 'promotion';
  confidence: number; // 0-1
  suggestedQuantity?: number;
}

export interface BarcodeResult {
  success: boolean;
  barcode?: string;
  product?: Product;
  error?: string;
}
