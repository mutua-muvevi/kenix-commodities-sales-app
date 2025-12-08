import { Product, Category } from "../types/product";
import { User } from "../types/user";
import { Order } from "../types/order";
import { CartItem } from "../types/cart";

// Mock Categories with proper images from Unsplash
export const enhancedMockCategories: Category[] = [
	{
		_id: "cat_1",
		name: "Fresh Fruits",
		image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop&auto=format",
		products: [
			{ product: "prod_1" },
			{ product: "prod_2" },
			{ product: "prod_3" },
			{ product: "prod_15" },
			{ product: "prod_16" },
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_2",
		name: "Vegetables",
		image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&auto=format",
		products: [
			{ product: "prod_4" },
			{ product: "prod_5" },
			{ product: "prod_6" },
			{ product: "prod_17" },
			{ product: "prod_18" },
			{ product: "prod_19" },
		],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_3",
		name: "Grains",
		image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_7" }, { product: "prod_8" }, { product: "prod_20" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_4",
		name: "Dairy",
		image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_9" }, { product: "prod_10" }, { product: "prod_21" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_5",
		name: "Bakery",
		image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_11" }, { product: "prod_12" }, { product: "prod_22" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_6",
		name: "Meat",
		image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_13" }, { product: "prod_14" }, { product: "prod_23" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_7",
		name: "Beverages",
		image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_24" }, { product: "prod_25" }, { product: "prod_26" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
	{
		_id: "cat_8",
		name: "Snacks",
		image: "https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=300&fit=crop&auto=format",
		products: [{ product: "prod_27" }, { product: "prod_28" }],
		createdBy: "user_2",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-15T12:00:00.000Z",
	},
];

// Enhanced Mock Users with different profiles
export const enhancedMockUsers: User[] = [
	{
		_id: "user_1",
		name: "John Doe",
		email: "john.doe@example.com",
		role: "user",
		country: "Kenya",
		emailVerified: true,
		isBanned: false,
		memberType: "premium",
		createdAt: "2024-01-15T08:30:00.000Z",
		updatedAt: "2024-01-20T14:20:00.000Z",
	},
	{
		_id: "user_2",
		name: "Jane Smith",
		email: "jane.smith@example.com",
		role: "admin",
		country: "Kenya",
		emailVerified: true,
		isBanned: false,
		memberType: "admin",
		createdAt: "2024-01-10T10:15:00.000Z",
		updatedAt: "2024-01-22T16:45:00.000Z",
	},
	{
		_id: "user_3",
		name: "Peter Mwangi",
		email: "peter.mwangi@example.com",
		role: "user",
		country: "Kenya",
		emailVerified: true,
		isBanned: false,
		memberType: "standard",
		createdAt: "2024-01-05T12:00:00.000Z",
		updatedAt: "2024-01-18T09:30:00.000Z",
	},
	{
		_id: "user_4",
		name: "Sarah Johnson",
		email: "sarah.johnson@example.com",
		role: "user",
		country: "Kenya",
		emailVerified: false,
		isBanned: false,
		memberType: "standard",
		createdAt: "2024-01-25T16:45:00.000Z",
		updatedAt: "2024-01-25T16:45:00.000Z",
	},
];

// Enhanced Mock Products with more variety and realistic pricing (KES)
export const enhancedMockProducts: Product[] = [
	// FRESH FRUITS (5 items)
	{
		_id: "prod_1",
		name: "Organic Red Apples",
		wholePrice: 450.0,
		unitPrice: 45.0,
		quantity: 150,
		unitOfMeasure: "kg",
		description: "Fresh organic red apples, crisp and sweet. Perfect for snacking or baking.",
		images: ["https://images.unsplash.com/photo-1567306301408-9b74de8888c4?w=400&h=400&fit=crop"],
		category: "Fresh Fruits",
		brand: "Organic Farm Kenya",
		inStock: true,
		tags: ["organic", "fresh", "healthy", "vitamin-c"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_2",
		name: "Sweet Bananas",
		wholePrice: 180.0,
		unitPrice: 18.0,
		quantity: 200,
		unitOfMeasure: "kg",
		description: "Fresh sweet bananas, rich in potassium and natural sugars.",
		images: ["https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop"],
		category: "Fresh Fruits",
		brand: "Tropical Farms",
		inStock: true,
		tags: ["sweet", "potassium", "energy", "natural"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_3",
		name: "Juicy Oranges",
		wholePrice: 320.0,
		unitPrice: 32.0,
		quantity: 120,
		unitOfMeasure: "kg",
		description: "Fresh juicy oranges packed with vitamin C, perfect for breakfast.",
		images: ["https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop"],
		category: "Fresh Fruits",
		brand: "Citrus Valley",
		inStock: true,
		tags: ["citrus", "vitamin-c", "fresh", "breakfast"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_15",
		name: "Fresh Mangoes",
		wholePrice: 400.0,
		unitPrice: 40.0,
		quantity: 80,
		unitOfMeasure: "kg",
		description: "Sweet tropical mangoes, perfectly ripe and full of flavor.",
		images: ["https://images.unsplash.com/photo-1605027990121-cbae9c10c38f?w=400&h=400&fit=crop"],
		category: "Fresh Fruits",
		brand: "Tropical Farms",
		inStock: true,
		tags: ["tropical", "sweet", "vitamin-a", "fiber"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_16",
		name: "Fresh Avocados",
		wholePrice: 600.0,
		unitPrice: 60.0,
		quantity: 60,
		unitOfMeasure: "kg",
		description: "Creamy Hass avocados, perfect for salads and healthy meals.",
		images: ["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop"],
		category: "Fresh Fruits",
		brand: "Highland Farms",
		inStock: true,
		tags: ["healthy-fats", "creamy", "salad", "superfood"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// FRESH VEGETABLES (6 items)
	{
		_id: "prod_4",
		name: "Green Spinach",
		wholePrice: 150.0,
		unitPrice: 15.0,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "Fresh organic spinach leaves, rich in iron and vitamins.",
		images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Green Valley",
		inStock: true,
		tags: ["leafy", "iron", "vitamins", "organic"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_5",
		name: "Fresh Tomatoes",
		wholePrice: 200.0,
		unitPrice: 20.0,
		quantity: 150,
		unitOfMeasure: "kg",
		description: "Fresh red tomatoes, perfect for cooking and salads.",
		images: ["https://images.unsplash.com/photo-1546470427-e30b67dcbeb0?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Farm Fresh",
		inStock: true,
		tags: ["fresh", "cooking", "salads", "vitamin-c"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_6",
		name: "Purple Cabbage",
		wholePrice: 120.0,
		unitPrice: 12.0,
		quantity: 80,
		unitOfMeasure: "head",
		description: "Fresh purple cabbage, crisp and colorful for salads and coleslaw.",
		images: ["https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Organic Valley",
		inStock: true,
		tags: ["crisp", "colorful", "salads", "vitamin-k"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_17",
		name: "Fresh Carrots",
		wholePrice: 180.0,
		unitPrice: 18.0,
		quantity: 120,
		unitOfMeasure: "kg",
		description: "Crunchy orange carrots, rich in beta-carotene and natural sweetness.",
		images: ["https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Root Farms",
		inStock: true,
		tags: ["crunchy", "beta-carotene", "sweet", "healthy"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_18",
		name: "Fresh Onions",
		wholePrice: 160.0,
		unitPrice: 16.0,
		quantity: 200,
		unitOfMeasure: "kg",
		description: "Fresh red onions, essential for cooking and adding flavor to meals.",
		images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Kitchen Essentials",
		inStock: true,
		tags: ["cooking", "flavor", "essential", "aromatic"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_19",
		name: "Green Bell Peppers",
		wholePrice: 250.0,
		unitPrice: 25.0,
		quantity: 80,
		unitOfMeasure: "kg",
		description: "Fresh green bell peppers, crisp and perfect for stir-fries.",
		images: ["https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ea?w=400&h=400&fit=crop"],
		category: "Fresh Vegetables",
		brand: "Fresh Garden",
		inStock: true,
		tags: ["crisp", "stir-fry", "vitamin-c", "colorful"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// GRAINS & CEREALS (3 items)
	{
		_id: "prod_7",
		name: "Premium Basmati Rice",
		wholePrice: 850.0,
		unitPrice: 85.0,
		quantity: 200,
		unitOfMeasure: "kg",
		description: "Premium quality basmati rice with long grains and aromatic fragrance.",
		images: ["https://images.unsplash.com/photo-1586201375761-83865001e7c9?w=400&h=400&fit=crop"],
		category: "Grains & Cereals",
		brand: "Royal Grain",
		inStock: true,
		tags: ["premium", "aromatic", "long-grain", "staple"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_8",
		name: "Whole Wheat Flour",
		wholePrice: 380.0,
		unitPrice: 38.0,
		quantity: 150,
		unitOfMeasure: "kg",
		description: "Stone-ground whole wheat flour, perfect for healthy baking.",
		images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop"],
		category: "Grains & Cereals",
		brand: "Miller's Best",
		inStock: true,
		tags: ["whole-grain", "healthy", "baking", "nutritious"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_20",
		name: "Rolled Oats",
		wholePrice: 420.0,
		unitPrice: 42.0,
		quantity: 100,
		unitOfMeasure: "kg",
		description: "Premium rolled oats, perfect for healthy breakfast porridge.",
		images: ["https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop"],
		category: "Grains & Cereals",
		brand: "Healthy Morning",
		inStock: true,
		tags: ["breakfast", "healthy", "fiber", "porridge"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// DAIRY PRODUCTS (3 items)
	{
		_id: "prod_9",
		name: "Fresh Milk",
		wholePrice: 120.0,
		unitPrice: 60.0,
		quantity: 80,
		unitOfMeasure: "liter",
		description: "Fresh pasteurized milk from local dairy farms.",
		images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop"],
		category: "Dairy Products",
		brand: "Dairy Fresh Kenya",
		inStock: true,
		tags: ["fresh", "pasteurized", "calcium", "protein"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_10",
		name: "Cheddar Cheese",
		wholePrice: 650.0,
		unitPrice: 65.0,
		quantity: 40,
		unitOfMeasure: "pack",
		description: "Aged cheddar cheese with rich flavor, perfect for sandwiches.",
		images: ["https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop"],
		category: "Dairy Products",
		brand: "Cheese Master",
		inStock: true,
		tags: ["aged", "rich-flavor", "sandwiches", "protein"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_21",
		name: "Greek Yogurt",
		wholePrice: 580.0,
		unitPrice: 145.0,
		quantity: 60,
		unitOfMeasure: "cup",
		description: "Thick creamy Greek yogurt, high in protein and probiotics.",
		images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop"],
		category: "Dairy Products",
		brand: "Mediterranean Dairy",
		inStock: true,
		tags: ["thick", "creamy", "protein", "probiotics"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// BAKERY ITEMS (3 items)
	{
		_id: "prod_11",
		name: "Whole Wheat Bread",
		wholePrice: 280.0,
		unitPrice: 35.0,
		quantity: 60,
		unitOfMeasure: "loaf",
		description: "Fresh baked whole wheat bread, soft and nutritious.",
		images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop"],
		category: "Bakery Items",
		brand: "Baker's Choice",
		inStock: true,
		tags: ["fresh-baked", "soft", "nutritious", "daily"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_12",
		name: "Chocolate Croissants",
		wholePrice: 480.0,
		unitPrice: 40.0,
		quantity: 30,
		unitOfMeasure: "piece",
		description: "Buttery croissants filled with rich chocolate, perfect for breakfast.",
		images: ["https://images.unsplash.com/photo-1555507036-ab794f575c8c?w=400&h=400&fit=crop"],
		category: "Bakery Items",
		brand: "Artisan Bakery",
		inStock: true,
		tags: ["buttery", "chocolate", "breakfast", "pastry"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_22",
		name: "Dinner Rolls",
		wholePrice: 200.0,
		unitPrice: 20.0,
		quantity: 80,
		unitOfMeasure: "pack",
		description: "Soft dinner rolls, perfect accompaniment to any meal.",
		images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop"],
		category: "Bakery Items",
		brand: "Home Bakery",
		inStock: true,
		tags: ["soft", "dinner", "accompaniment", "fresh"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// MEAT & POULTRY (3 items)
	{
		_id: "prod_13",
		name: "Free Range Chicken",
		wholePrice: 1200.0,
		unitPrice: 120.0,
		quantity: 25,
		unitOfMeasure: "kg",
		description: "Fresh free-range chicken, hormone-free and naturally raised.",
		images: ["https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop"],
		category: "Meat & Poultry",
		brand: "Farm Fresh Meats",
		inStock: true,
		tags: ["free-range", "hormone-free", "fresh", "natural"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_14",
		name: "Ground Beef",
		wholePrice: 1500.0,
		unitPrice: 150.0,
		quantity: 0, // Out of stock for testing
		unitOfMeasure: "kg",
		description: "Premium ground beef, perfect for burgers and meatballs.",
		images: ["https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop"],
		category: "Meat & Poultry",
		brand: "Prime Cuts",
		inStock: false,
		tags: ["premium", "burgers", "meatballs", "ground"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_23",
		name: "Fresh Fish Fillet",
		wholePrice: 1800.0,
		unitPrice: 180.0,
		quantity: 15,
		unitOfMeasure: "kg",
		description: "Fresh tilapia fillet, sustainably caught and perfectly cleaned.",
		images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop"],
		category: "Meat & Poultry",
		brand: "Ocean Fresh",
		inStock: true,
		tags: ["fresh", "sustainable", "tilapia", "omega-3"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// BEVERAGES (3 items)
	{
		_id: "prod_24",
		name: "Natural Orange Juice",
		wholePrice: 350.0,
		unitPrice: 70.0,
		quantity: 100,
		unitOfMeasure: "bottle",
		description: "100% natural orange juice, no added sugar or preservatives.",
		images: ["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop"],
		category: "Beverages",
		brand: "Pure Juice Co.",
		inStock: true,
		tags: ["natural", "no-sugar", "vitamin-c", "fresh"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_25",
		name: "Mineral Water",
		wholePrice: 180.0,
		unitPrice: 30.0,
		quantity: 200,
		unitOfMeasure: "bottle",
		description: "Pure natural mineral water from highland springs.",
		images: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop"],
		category: "Beverages",
		brand: "Highland Springs",
		inStock: true,
		tags: ["pure", "natural", "mineral", "hydration"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_26",
		name: "Green Tea",
		wholePrice: 480.0,
		unitPrice: 120.0,
		quantity: 80,
		unitOfMeasure: "box",
		description: "Premium green tea bags, rich in antioxidants and natural flavor.",
		images: ["https://images.unsplash.com/photo-1564890273409-0c8363ece8ca?w=400&h=400&fit=crop"],
		category: "Beverages",
		brand: "Tea Garden",
		inStock: true,
		tags: ["green-tea", "antioxidants", "premium", "healthy"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},

	// SNACKS & SWEETS (2 items)
	{
		_id: "prod_27",
		name: "Mixed Nuts",
		wholePrice: 720.0,
		unitPrice: 180.0,
		quantity: 50,
		unitOfMeasure: "pack",
		description: "Premium mix of almonds, cashews, and peanuts. Perfect healthy snack.",
		images: ["https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=400&fit=crop"],
		category: "Snacks & Sweets",
		brand: "Nutty Delights",
		inStock: true,
		tags: ["healthy", "protein", "mixed", "premium"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
	{
		_id: "prod_28",
		name: "Dark Chocolate Bar",
		wholePrice: 380.0,
		unitPrice: 95.0,
		quantity: 60,
		unitOfMeasure: "bar",
		description: "Rich 70% dark chocolate bar, perfect for chocolate lovers.",
		images: ["https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop"],
		category: "Snacks & Sweets",
		brand: "Chocolate Master",
		inStock: true,
		tags: ["dark-chocolate", "rich", "70%", "premium"],
		createdBy: "user_2",
		createdAt: "2024-01-10T08:00:00.000Z",
		updatedAt: "2024-01-20T10:30:00.000Z",
	},
];

// Enhanced Mock Orders with realistic scenarios
export const enhancedMockOrders: Order[] = [
	{
		_id: "order_1",
		orderer: "user_1",
		products: [
			{ product: "prod_1", quantity: 2 }, // Apples
			{ product: "prod_5", quantity: 3 }, // Tomatoes
			{ product: "prod_9", quantity: 2 }, // Milk
			{ product: "prod_11", quantity: 1 }, // Bread
		],
		orderId: "ORD-20240120-001",
		status: "completed",
		totalPrice: 485.0, // 90 + 60 + 120 + 35 = 305
		paymentMethod: "mpesa",
		createdBy: "user_1",
		createdAt: "2024-01-20T14:30:00.000Z",
		updatedAt: "2024-01-20T15:45:00.000Z",
	},
	{
		_id: "order_2",
		orderer: "user_1",
		products: [
			{ product: "prod_7", quantity: 1 }, // Rice
			{ product: "prod_13", quantity: 1 }, // Chicken
			{ product: "prod_17", quantity: 2 }, // Carrots
		],
		orderId: "ORD-20240122-002",
		status: "pending",
		totalPrice: 241.0, // 85 + 120 + 36 = 241
		paymentMethod: "cash",
		createdBy: "user_1",
		createdAt: "2024-01-22T09:15:00.000Z",
		updatedAt: "2024-01-22T09:15:00.000Z",
	},
	{
		_id: "order_3",
		orderer: "user_3",
		products: [
			{ product: "prod_16", quantity: 1 }, // Avocados
			{ product: "prod_4", quantity: 2 }, // Spinach
			{ product: "prod_21", quantity: 3 }, // Greek Yogurt
			{ product: "prod_26", quantity: 1 }, // Green Tea
		],
		orderId: "ORD-20240123-003",
		status: "completed",
		totalPrice: 585.0, // 60 + 30 + 435 + 120 = 645
		paymentMethod: "mpesa",
		createdBy: "user_3",
		createdAt: "2024-01-23T11:20:00.000Z",
		updatedAt: "2024-01-23T16:30:00.000Z",
	},
	{
		_id: "order_4",
		orderer: "user_4",
		products: [
			{ product: "prod_27", quantity: 2 }, // Mixed Nuts
			{ product: "prod_28", quantity: 1 }, // Dark Chocolate
			{ product: "prod_24", quantity: 2 }, // Orange Juice
		],
		orderId: "ORD-20240124-004",
		status: "pending",
		totalPrice: 595.0, // 360 + 95 + 140 = 595
		paymentMethod: "airtel",
		createdBy: "user_4",
		createdAt: "2024-01-24T13:45:00.000Z",
		updatedAt: "2024-01-24T13:45:00.000Z",
	},
	{
		_id: "order_5",
		orderer: "user_1",
		products: [
			{ product: "prod_14", quantity: 1 }, // Ground Beef (out of stock)
		],
		orderId: "ORD-20240125-005",
		status: "cancelled",
		totalPrice: 150.0,
		paymentMethod: "mpesa",
		createdBy: "user_1",
		createdAt: "2024-01-25T08:15:00.000Z",
		updatedAt: "2024-01-25T08:45:00.000Z",
	},
];

// Enhanced Mock Cart Items for testing
export const enhancedMockCartItems: CartItem[] = [
	{
		productId: "prod_1",
		name: "Organic Red Apples",
		unitPrice: 45.0,
		wholePrice: 450.0,
		quantity: 2,
		unitOfMeasure: "kg",
		image: "https://images.unsplash.com/photo-1567306301408-9b74de8888c4?w=400&h=400&fit=crop",
		inStock: true,
	},
	{
		productId: "prod_9",
		name: "Fresh Milk",
		unitPrice: 60.0,
		wholePrice: 120.0,
		quantity: 1,
		unitOfMeasure: "liter",
		image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop",
		inStock: true,
	},
	{
		productId: "prod_11",
		name: "Whole Wheat Bread",
		unitPrice: 35.0,
		wholePrice: 280.0,
		quantity: 1,
		unitOfMeasure: "loaf",
		image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
		inStock: true,
	},
];

// Enhanced utility functions for working with mock data
export const enhancedDataUtils = {
	// Get products by category
	getProductsByCategory: (categoryId: string): Product[] => {
		const category = enhancedMockCategories.find((cat) => cat._id === categoryId);
		if (!category) return [];
		
		const productIds = category.products.map((p) => p.product);
		return enhancedMockProducts.filter((product) => productIds.includes(product._id));
	},

	// Get products by IDs
	getProductsByIds: (productIds: string[]): Product[] => {
		return enhancedMockProducts.filter((product) => productIds.includes(product._id));
	},

	// Search products by query
	searchProducts: (query: string): Product[] => {
		const lowercaseQuery = query.toLowerCase();
		return enhancedMockProducts.filter(
			(product) =>
				product.name.toLowerCase().includes(lowercaseQuery) ||
				product.description?.toLowerCase().includes(lowercaseQuery) ||
				product.brand?.toLowerCase().includes(lowercaseQuery) ||
				product.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
				product.category?.toLowerCase().includes(lowercaseQuery),
		);
	},

	// Get featured products (first 6 products)
	getFeaturedProducts: (): Product[] => {
		return enhancedMockProducts.slice(0, 6);
	},

	// Get products by availability
	getInStockProducts: (): Product[] => {
		return enhancedMockProducts.filter((product) => product.inStock && product.quantity > 0);
	},

	getOutOfStockProducts: (): Product[] => {
		return enhancedMockProducts.filter((product) => !product.inStock || product.quantity === 0);
	},

	// Get products by price range
	getProductsByPriceRange: (minPrice: number, maxPrice: number): Product[] => {
		return enhancedMockProducts.filter(
			(product) => product.unitPrice >= minPrice && product.unitPrice <= maxPrice,
		);
	},

	// Get random products
	getRandomProducts: (count: number): Product[] => {
		const shuffled = [...enhancedMockProducts].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	},

	// Get orders by user
	getOrdersByUser: (userId: string): Order[] => {
		return enhancedMockOrders.filter((order) => order.orderer === userId);
	},

	// Get orders by status
	getOrdersByStatus: (status: "pending" | "completed" | "cancelled"): Order[] => {
		return enhancedMockOrders.filter((order) => order.status === status);
	},

	// Calculate cart totals
	calculateCartTotals: (cartItems: CartItem[]) => {
		const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
		const totalPrice = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
		const averageItemPrice = totalItems > 0 ? totalPrice / totalItems : 0;
		
		return {
			totalItems,
			totalPrice,
			itemCount: cartItems.length,
			averageItemPrice: Math.round(averageItemPrice * 100) / 100,
		};
	},

	// Get category statistics
	getCategoryStats: () => {
		return enhancedMockCategories.map((category) => {
			const products = enhancedDataUtils.getProductsByCategory(category._id);
			const inStockCount = products.filter((p) => p.inStock && p.quantity > 0).length;
			const totalValue = products.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
			
			return {
				categoryId: category._id,
				categoryName: category.name,
				totalProducts: products.length,
				inStockProducts: inStockCount,
				outOfStockProducts: products.length - inStockCount,
				totalInventoryValue: totalValue,
				icon: category.icon,
			};
		});
	},

	// Get popular products (based on order frequency - simplified mock)
	getPopularProducts: (limit: number = 5): Product[] => {
		// For mock data, we'll just return random products
		// In real app, this would be based on actual order data
		const popularIds = ["prod_1", "prod_5", "prod_9", "prod_11", "prod_13"];
		return enhancedMockProducts
			.filter((product) => popularIds.includes(product._id))
			.slice(0, limit);
	},
};

// Export everything
export {
	enhancedMockUsers as mockUsers,
	enhancedMockCategories as mockCategories,
	enhancedMockProducts as mockProducts,
	enhancedMockOrders as mockOrders,
	enhancedMockCartItems as mockCartItems,
};