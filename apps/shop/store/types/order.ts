export interface OrderItem {
	product: string; // ObjectId reference
	quantity: number;
}

export interface Order {
	_id: string;
	orderer: string;
	products: OrderItem[];
	orderId: string;
	status: "pending" | "completed" | "cancelled";
	totalPrice: number; // Calculated by server middleware
	paymentMethod: "cash" | "mpesa" | "airtel";
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateOrderData {
	orderer: string;
	products: OrderItem[];
	paymentMethod: "cash" | "mpesa" | "airtel";
	// orderId and totalPrice calculated by server
}
