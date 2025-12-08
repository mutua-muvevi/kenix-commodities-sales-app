export interface Product {
	_id: string;
	name: string;
	wholePrice: number;
	unitPrice: number;
	quantity: number;
	unitOfMeasure: string;
	description?: string;
	images?: string[];
	category?: string;
	brand?: string;
	inStock: boolean;
	tags?: string[];
	createdBy: string;
	updatedBy?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	_id: string;
	name: string;
	image: string; // Changed from icon to image to match server model
	products: { product: string }[];
	createdBy: string;
	updatedBy?: string;
	createdAt: string;
	updatedAt: string;
	// Client-side computed fields
	subcategories?: Category[];
}
