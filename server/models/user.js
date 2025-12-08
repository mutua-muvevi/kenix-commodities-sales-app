//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

// approved by subdocuement
const ApprovedSchema = new Schema({
	isApproved: {
		type: Boolean,
		default: false
	},
	approvedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	}
})

// email verification subdocument
const EmailVerificationSchema = new Schema({
	emailOTP: {
		type: String,
	},
	emailOtpExpiry: {
		type: Date,
	},
})

// phone verification subdocument
const PhoneVerificationSchema = new Schema({
	phoneOTP: {
		type: String,
	},
	phoneOtpExpiry: {
		type: Date,
	},
})

// ban user subdocument
const BanUserSchema = new Schema({
	isBanned: {
		type: Boolean,
		default: false
	},
	bannedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
});

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "users",
	optimisticConcurrency: true,
};

const UserSchema = new Schema({
	UUID: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		lowercase: true,
		index: true,
	},
	role: {
		type: String,
		required: true,
		trim: true,
		enum: ["admin", "shop", "sales_agent", "rider"],
		default: "shop",
	},
	country: {
		type: String,
		required: true,
		trim: true,
		default: "kenya",
	},

	// Phone number - required for all users
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		index: true,
	},

	// Shop-specific fields
	shopName: {
		type: String,
		trim: true,
		// Required for shop role, validated at application level
	},
	mpesaBusinessNumber: {
		type: String,
		trim: true,
		// M-Pesa till/paybill number for shops
	},
	location: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
		},
		address: {
			type: String,
			trim: true,
		},
	},

	// Rider-specific fields
	vehicleInfo: {
		vehicleType: {
			type: String,
			enum: ['motorcycle', 'van', 'truck', 'bicycle'],
		},
		vehicleRegistration: {
			type: String,
			trim: true,
		},
		licenseNumber: {
			type: String,
			trim: true,
		},
	},

	// Sales Agent-specific fields
	assignedTerritory: {
		type: Schema.Types.ObjectId,
		ref: "Route",
	},

	approved: ApprovedSchema,
	banStatus: BanUserSchema,

	hash: {
		type: String,
	},
	resetPasswordToken: {
		type: String,
	},
	resetPasswordExpiry: {
		type: Date,
	},

	// emailVerification: EmailVerificationSchema,
	emailOTP: {
		type: String,
	},
	emailOtpExpiry: {
		type: Date,
	},
	phoneVerification: PhoneVerificationSchema,

	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	}
	
}, MainSchemaOptions);

//middleware to remove reset password token and expiry after reset password or expiry
UserSchema.pre("save", function (next) {
	if (this.resetPasswordToken && this.resetPasswordExpiry < new Date()) {
		this.resetPasswordToken = undefined;
		this.resetPasswordExpiry = undefined;
	}
	next();
});

//middleware that check if emailOtp exists and deletes it after 3 hours
UserSchema.pre("save", function (next) {
	if (this.emailOTP && this.emailOtpExpiry < new Date()) {
		this.emailOTP = undefined;
		this.emailOtpExpiry = undefined;
	}
	next();
});

// Create geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;