//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "categories",
	optimisticConcurrency: true,
};

const CategorySchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true,
	},
	description: {
		type: String,
		trim: true,
		default: "",
	},
	// Hierarchical category support (subcategories)
	parentCategory: {
		type: Schema.Types.ObjectId,
		ref: "Category",
		default: null,
	},
	image: {
		type: String,
		default: "",
		trim: true,
	},
	displayOrder: {
		type: Number,
		default: 0,
		// Lower numbers appear first in UI
	},
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
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

module.exports = Category;