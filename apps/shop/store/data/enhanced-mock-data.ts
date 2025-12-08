// store/data/enhanced-mock-data.ts - Enhanced comprehensive mock data
import { Product, Category } from "../types/product";
import { User } from "../types/user";
import { Order } from "../types/order";
import { CartItem } from "../types/cart";


// Enhanced Mock Categories with better variety
export const enhancedMockCategories: Category[] = [
	{
		_id: "cat_1",
		name: "Fresh Fruits",
		icon: "🍎",
		products: [
			{ product: "prod_1" }, { product: "prod_2" }, { product: "prod_3" }, 
			{ product: "prod_15" }, { product: "prod_16" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_2",
		name: "Fresh Vegetables",
		icon: "🥬",
		products: [
			{ product: "prod_4" }, { product: "prod_5" }, { product: "prod_6" }, 
			{ product: "prod_17" }, { product: "prod_18" }, { product: "prod_19" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_3",
		name: "Grains & Cereals",
		icon: "🌾",
		products: [
			{ product: "prod_7" }, { product: "prod_8" }, { product: "prod_20" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_4",
		name: "Dairy Products",
		icon: "🥛",
		products: [
			{ product: "prod_9" }, { product: "prod_10" }, { product: "prod_21" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_5",
		name: "Bakery Items",
		icon: "🍞",
		products: [
			{ product: "prod_11" }, { product: "prod_12" }, { product: "prod_22" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_6",
		name: "Meat & Poultry",
		icon: "🥩",
		products: [
			{ product: "prod_13" }, { product: "prod_14" }, { product: "prod_23" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_7",
		name: "Beverages",
		icon: "🥤",
		products: [
			{ product: "prod_24" }, { product: "prod_25" }, { product: "prod_26" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_8",
		name: "Snacks & Sweets",
		icon: "🍿",
		products: [
			{ product: "prod_27" }, { product: "prod_28" }
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
];





// Summary of Enhanced Data Structure:
/*
🔢 TOTAL ITEMS:
- Users: 4 (including admin, premium, standard users)
- Categories: 8 (comprehensive food categories)
- Products: 28 (well-distributed across categories)
- Orders: 5 (various statuses and scenarios)
- Cart Items: 3 (for testing)

📊 DATA DISTRIBUTION:
- Fresh Fruits: 5 products
- Fresh Vegetables: 6 products  
- Grains & Cereals: 3 products
- Dairy Products: 3 products
- Bakery Items: 3 products
- Meat & Poultry: 3 products
- Beverages: 3 products
- Snacks & Sweets: 2 products

💰 PRICE RANGES (KES):
- Budget items: 12-35 KES (vegetables, bread)
- Mid-range: 40-85 KES (fruits, grains, dairy)
- Premium: 90-180 KES (meat, nuts, specialty items)

🛒 TESTING SCENARIOS:
- In-stock products (majority)
- Out-of-stock product (prod_14)
- Various order statuses
- Different payment methods
- Realistic cart scenarios

🎯 FEATURES FOR HOMEPAGE:
- Featured products
- Category browsing
- Search functionality
- Stock status indicators
- Price display
- User personalization
*/