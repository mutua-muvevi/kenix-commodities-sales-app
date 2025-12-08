// config/database-indexes.js
const logger = require("../utils/logger");

//----------------------------------------------------------------------
// Business collection indexes for optimal performance
const createBusinessIndexes = async (db) => {
	try {
		const businessCollection = db.collection("businesses");

		// Compound indexes for common query patterns
		const indexes = [
			// Text search index
			{
				name: "business_text_search",
				key: {
					businessName: "text",
					description: "text",
					"basicInfo.email": "text",
					"location.city": "text",
					"location.state": "text",
					"location.country": "text",
				},
				options: {
					weights: {
						businessName: 10,
						description: 5,
						"basicInfo.email": 3,
						"location.city": 2,
						"location.state": 2,
						"location.country": 1,
					},
					name: "business_text_search",
				},
			},

			// Admin filtering indexes
			{
				name: "admin_filter_compound",
				key: {
					isVerified: 1,
					isSponsored: 1,
					isFlagged: 1,
					isActive: 1,
					createdAt: -1,
				},
				options: { name: "admin_filter_compound" },
			},

			// Location-based queries
			{
				name: "location_2dsphere",
				key: { "location.coordinates": "2dsphere" },
				options: { name: "location_2dsphere" },
			},

			// Category and rating
			{
				name: "category_rating",
				key: {
					category: 1,
					overalRating: -1,
					isActive: 1,
				},
				options: { name: "category_rating" },
			},

			// Owner-based queries
			{
				name: "owner_businesses",
				key: {
					owner: 1,
					isActive: 1,
					createdAt: -1,
				},
				options: { name: "owner_businesses" },
			},

			// Date range queries
			{
				name: "date_range_compound",
				key: {
					createdAt: -1,
					updatedAt: -1,
					isActive: 1,
				},
				options: { name: "date_range_compound" },
			},

			// Verification and sponsorship tracking
			{
				name: "verification_tracking",
				key: {
					isVerified: 1,
					verifiedAt: -1,
					verifiedBy: 1,
				},
				options: {
					name: "verification_tracking",
					partialFilterExpression: { isVerified: true },
				},
			},

			// Sponsorship tracking
			{
				name: "sponsorship_tracking",
				key: {
					isSponsored: 1,
					sponsoredAt: -1,
					sponsorshipExpiry: 1,
				},
				options: {
					name: "sponsorship_tracking",
					partialFilterExpression: { isSponsored: true },
				},
			},

			// Map queries optimization
			{
				name: "map_optimization",
				key: {
					"location.city": 1,
					"location.state": 1,
					isActive: 1,
					isVerified: 1,
				},
				options: { name: "map_optimization" },
			},
		];

		// Create indexes
		for (const index of indexes) {
			try {
				await businessCollection.createIndex(index.key, index.options);
				logger.info(`Created index: ${index.name}`);
			} catch (error) {
				if (error.code === 85) {
					// Index already exists
					logger.info(`Index already exists: ${index.name}`);
				} else {
					logger.error(`Failed to create index ${index.name}: ${error.message}`);
				}
			}
		}

		// Single field indexes
		const singleIndexes = [
			{ field: "businessName", order: 1 },
			{ field: "createdBy", order: 1 },
			{ field: "updatedAt", order: -1 },
			{ field: "overalRating", order: -1 },
			{ field: "reviewsCount", order: -1 },
		];

		for (const { field, order } of singleIndexes) {
			try {
				await businessCollection.createIndex({ [field]: order });
				logger.info(`Created single field index: ${field}`);
			} catch (error) {
				if (error.code !== 85) {
					logger.error(`Failed to create single index ${field}: ${error.message}`);
				}
			}
		}

		logger.info("Business collection indexes created successfully");
	} catch (error) {
		logger.error(`Error creating business indexes: ${error.message}`);
		throw error;
	}
};

//----------------------------------------------------------------------
// Create indexes for related collections
const createRelatedIndexes = async (db) => {
	try {
		// Reviews collection indexes
		const reviewsCollection = db.collection("reviews");
		await reviewsCollection.createIndex({ business: 1, createdAt: -1 });
		await reviewsCollection.createIndex({ createdBy: 1, createdAt: -1 });
		await reviewsCollection.createIndex({ rating: -1, isApproved: 1 });

		// Users collection indexes for business owners
		const usersCollection = db.collection("users");
		await usersCollection.createIndex({ role: 1, isActive: 1 });
		await usersCollection.createIndex({ email: 1 }, { unique: true });

		// Categories collection indexes
		const categoriesCollection = db.collection("categories");
		await categoriesCollection.createIndex({ name: 1 }, { unique: true });
		await categoriesCollection.createIndex({ industry: 1 });

		logger.info("Related collection indexes created successfully");
	} catch (error) {
		logger.error(`Error creating related indexes: ${error.message}`);
	}
};

//----------------------------------------------------------------------
// Initialize all indexes
const initializeIndexes = async (db) => {
	try {
		logger.info("Starting database index creation...");

		await Promise.all([createBusinessIndexes(db), createRelatedIndexes(db)]);

		logger.info("All database indexes initialized successfully");
	} catch (error) {
		logger.error(`Failed to initialize indexes: ${error.message}`);
		throw error;
	}
};

//----------------------------------------------------------------------
// Index maintenance and optimization
const optimizeIndexes = async (db) => {
	try {
		const businessCollection = db.collection("businesses");

		// Get index usage statistics
		const indexStats = await businessCollection.aggregate([{ $indexStats: {} }]).toArray();

		logger.info("Current index usage statistics:", {
			indexes: indexStats.map((stat) => ({
				name: stat.name,
				usageCount: stat.accesses?.ops || 0,
				since: stat.accesses?.since,
			})),
		});

		// Reindex collection for optimization
		await businessCollection.reIndex();
		logger.info("Business collection reindexed successfully");
	} catch (error) {
		logger.error(`Index optimization failed: ${error.message}`);
	}
};

//----------------------------------------------------------------------
// Drop unused indexes
const dropUnusedIndexes = async (db) => {
	try {
		const businessCollection = db.collection("businesses");

		// Get current indexes
		const indexes = await businessCollection.listIndexes().toArray();
		const indexStats = await businessCollection.aggregate([{ $indexStats: {} }]).toArray();

		// Find unused indexes (no operations in last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const unusedIndexes = indexStats.filter((stat) => {
			const lastUsed = stat.accesses?.since;
			return lastUsed && new Date(lastUsed) < thirtyDaysAgo && stat.accesses.ops === 0;
		});

		// Drop unused indexes (except _id)
		for (const unusedIndex of unusedIndexes) {
			if (unusedIndex.name !== "_id_") {
				try {
					await businessCollection.dropIndex(unusedIndex.name);
					logger.info(`Dropped unused index: ${unusedIndex.name}`);
				} catch (error) {
					logger.warn(`Could not drop index ${unusedIndex.name}: ${error.message}`);
				}
			}
		}
	} catch (error) {
		logger.error(`Error dropping unused indexes: ${error.message}`);
	}
};

//----------------------------------------------------------------------
// Performance monitoring for queries
const monitorQueryPerformance = (db) => {
	const businessCollection = db.collection("businesses");

	// Override find method to log slow queries
	const originalFind = businessCollection.find;
	businessCollection.find = function (...args) {
		const start = Date.now();
		const cursor = originalFind.apply(this, args);

		// Override toArray to measure execution time
		const originalToArray = cursor.toArray;
		cursor.toArray = async function () {
			const result = await originalToArray.call(this);
			const executionTime = Date.now() - start;

			if (executionTime > 1000) {
				// Log queries taking more than 1 second
				logger.warn("Slow query detected", {
					executionTime: `${executionTime}ms`,
					collection: "businesses",
					query: JSON.stringify(args[0] || {}),
					resultCount: result.length,
				});
			}

			return result;
		};

		return cursor;
	};
};

module.exports = {
	initializeIndexes,
	createBusinessIndexes,
	createRelatedIndexes,
	optimizeIndexes,
	dropUnusedIndexes,
	monitorQueryPerformance,
};
