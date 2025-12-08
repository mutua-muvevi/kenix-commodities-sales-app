// store/utils/data-sanitizer.ts - Prevent data leaks like your server
export const sanitizeUser = (user: any, allowedFields: string[]) => {
	const sanitized: any = {};
	allowedFields.forEach((field) => {
		if (user[field] !== undefined) {
			sanitized[field] = user[field];
		}
	});
	return sanitized;
};

export const sanitizeProduct = (product: any, allowedFields: string[]) => {
	const sanitized: any = {};
	allowedFields.forEach((field) => {
		if (product[field] !== undefined) {
			sanitized[field] = product[field];
		}
	});
	return sanitized;
};

export const sanitizeOrder = (order: any, allowedFields: string[]) => {
	const sanitized: any = {};
	allowedFields.forEach((field) => {
		if (order[field] !== undefined) {
			sanitized[field] = order[field];
		}
	});
	return sanitized;
};

// Client-side field definitions (matching your server patterns)
export const USER_FIELDS = [
	"_id",
	"name",
	"email",
	"role",
	"country",
	"emailVerified",
	"isBanned",
	"memberType",
	"createdAt",
	"updatedAt",
];

export const PRODUCT_FIELDS = [
	"_id",
	"name",
	"wholePrice",
	"unitPrice",
	"quantity",
	"unitOfMeasure",
	"description",
	"images",
	"category",
	"brand",
	"inStock",
	"createdAt",
	"updatedAt",
];

export const ORDER_FIELDS = [
	"_id",
	"orderer",
	"products",
	"orderId",
	"status",
	"totalPrice",
	"paymentMethod",
	"createdAt",
	"updatedAt",
];
