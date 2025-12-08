//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "products",
	optimisticConcurrency: true,
};

const ProductSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		index: true,
	},
	sku: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
	},
	description: {
		type: String,
		trim: true,
		default: "",
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: "Category",
		required: true,
		index: true,
	},
	wholePrice: {
		type: Number,
		required: true,
		min: 0,
	},
	unitPrice: {
		type: Number,
		required: true,
		min: 0,
	},
	unitOfMeasure: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['kg', 'g', 'piece', 'dozen', 'crate', 'bag', 'litre', 'ml', 'pack'],
	},
	images: [
		{
			type: String,
			trim: true,
			// URL to image stored in GCP bucket
		}
	],
	isActive: {
		type: Boolean,
		default: true,
		index: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	updatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
}, MainSchemaOptions);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

module.exports = Product;