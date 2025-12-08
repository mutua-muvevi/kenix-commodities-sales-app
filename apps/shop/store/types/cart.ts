// store/types/cart.ts - Complete cart types
export interface CartItem {
	productId: string;
	name: string;
	unitPrice: number;
	wholePrice: number;
	quantity: number;
	unitOfMeasure: string;
	image?: string;
	inStock: boolean;
}

export interface CartSummary {
	totalItems: number;
	totalPrice: number;
	itemCount: number;
	averageItemPrice: number;
}
