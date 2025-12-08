// config/performance-setup.js
const logger = require("../utils/logger");

//----------------------------------------------------------------------
// Database connection optimization
const optimizeDatabaseConnection = (mongoose) => {
	// Connection pool optimization
	mongoose.set("bufferCommands", false);
	mongoose.set("bufferMaxEntries", 0);

	// Query optimization
	mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
	mongoose.set("autoCreate", process.env.NODE_ENV !== "production");

	// Connection pooling
	const connectionOptions = {
		maxPoolSize: 20, // Maximum number of connections
		minPoolSize: 5, // Minimum number of connections
		maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
		serverSelectionTimeoutMS: 5000, // How long to try selecting a server
		socketTimeoutMS: 45000, // How long a send or receive on a socket can take
		bufferCommands: false,
		bufferMaxEntries: 0,
		compressors: ["zlib"], // Enable compression
	};

	return connectionOptions;
};

//----------------------------------------------------------------------
// Redis cache setup for API responses
const setupRedisCache = () => {
	let redisClient = null;

	if (process.env.REDIS_URL) {
		try {
			const redis = require("redis");
			redisClient = redis.createClient({
				url: process.env.REDIS_URL,
				retry_strategy: (options) => {
					if (options.error && options.error.code === "ECONNREFUSED") {
						return new Error("Redis server connection refused");
					}
					if (options.total_retry_time > 1000 * 60 * 60) {
						return new Error("Redis retry time exhausted");
					}
					if (options.attempt > 10) {
						return undefined;
					}
					return Math.min(options.attempt * 100, 3000);
				},
			});

			redisClient.on("error", (err) => {
				logger.error("Redis client error:", err);
			});

			redisClient.on("connect", () => {
				logger.info("Redis client connected successfully");
			});
		} catch (error) {
			logger.warn(`Redis setup failed: ${error.message}. Falling back to memory cache.`);
		}
	}

	return redisClient;
};

//----------------------------------------------------------------------
// Memory cache implementation as fallback
class MemoryCache {
	constructor(maxSize = 1000, ttl = 300000) {
		// 5 minutes default TTL
		this.cache = new Map();
		this.maxSize = maxSize;
		this.ttl = ttl;
		this.accessTimes = new Map();

		// Clean up expired entries every minute
		setInterval(() => this.cleanup(), 60000);
	}

	set(key, value, customTtl = null) {
		const expiry = Date.now() + (customTtl || this.ttl);

		// Remove oldest entries if cache is full
		if (this.cache.size >= this.maxSize) {
			this.evictOldest();
		}

		this.cache.set(key, { value, expiry });
		this.accessTimes.set(key, Date.now());
	}

	get(key) {
		const item = this.cache.get(key);

		if (!item) return null;

		if (Date.now() > item.expiry) {
			this.cache.delete(key);
			this.accessTimes.delete(key);
			return null;
		}

		this.accessTimes.set(key, Date.now());
		return item.value;
	}

	delete(key) {
		this.cache.delete(key);
		this.accessTimes.delete(key);
	}

	clear() {
		this.cache.clear();
		this.accessTimes.clear();
	}

	cleanup() {
		const now = Date.now();
		const expired = [];

		for (const [key, item] of this.cache.entries()) {
			if (now > item.expiry) {
				expired.push(key);
			}
		}

		expired.forEach((key) => {
			this.cache.delete(key);
			this.accessTimes.delete(key);
		});

		if (expired.length > 0) {
			logger.debug(`Cleaned up ${expired.length} expired cache entries`);
		}
	}

	evictOldest() {
		let oldestKey = null;
		let oldestTime = Date.now();

		for (const [key, time] of this.accessTimes.entries()) {
			if (time < oldestTime) {
				oldestTime = time;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
			this.accessTimes.delete(oldestKey);
		}
	}

	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			hitRate: this.hitRate || 0,
			ttl: this.ttl,
		};
	}
}

//----------------------------------------------------------------------
// Cache middleware for API responses
const createCacheMiddleware = (cache) => {
	return (duration = 300000) => {
		// 5 minutes default
		return (req, res, next) => {
			// Skip cache for POST, PUT, PATCH, DELETE
			if (req.method !== "GET") {
				return next();
			}

			// Create cache key from URL and query parameters
			const cacheKey = `${req.originalUrl}_${JSON.stringify(req.query)}`;

			// Try to get from cache
			const cachedResponse = cache.get(cacheKey);
			if (cachedResponse) {
				res.setHeader("X-Cache", "HIT");
				return res.json(cachedResponse);
			}

			// Override res.json to cache the response
			const originalJson = res.json;
			res.json = function (data) {
				// Cache successful responses only
				if (res.statusCode === 200 && data.success) {
					cache.set(cacheKey, data, duration);
				}
				res.setHeader("X-Cache", "MISS");
				return originalJson.call(this, data);
			};

			next();
		};
	};
};

//----------------------------------------------------------------------
// Query optimization middleware
const queryOptimizationMiddleware = (req, res, next) => {
	const start = Date.now();

	// Override res.json to log performance
	const originalJson = res.json;
	res.json = function (data) {
		const duration = Date.now() - start;

		// Log slow queries
		if (duration > 1000) {
			logger.warn("Slow API response", {
				path: req.path,
				method: req.method,
				duration: `${duration}ms`,
				query: req.query,
				resultSize: JSON.stringify(data).length,
			});
		}

		// Add performance headers
		res.setHeader("X-Response-Time", `${duration}ms`);
		res.setHeader("X-Timestamp", new Date().toISOString());

		return originalJson.call(this, data);
	};

	next();
};

//----------------------------------------------------------------------
// Request deduplication middleware
const requestDeduplicationMiddleware = () => {
	const activeRequests = new Map();

	return (req, res, next) => {
		// Only deduplicate GET requests
		if (req.method !== "GET") {
			return next();
		}

		const requestKey = `${req.originalUrl}_${JSON.stringify(req.query)}`;

		// Check if same request is already in progress
		if (activeRequests.has(requestKey)) {
			const existingRequest = activeRequests.get(requestKey);

			// Wait for existing request to complete
			existingRequest
				.then((result) => {
					res.json(result);
				})
				.catch((error) => {
					next(error);
				});

			return;
		}

		// Create promise for this request
		const requestPromise = new Promise((resolve, reject) => {
			const originalJson = res.json;
			const originalNext = next;

			res.json = function (data) {
				activeRequests.delete(requestKey);
				resolve(data);
				return originalJson.call(this, data);
			};

			next = function (error) {
				activeRequests.delete(requestKey);
				if (error) {
					reject(error);
				}
				return originalNext(error);
			};
		});

		activeRequests.set(requestKey, requestPromise);
		next();
	};
};

//----------------------------------------------------------------------
// Initialize performance optimizations
const initializePerformanceOptimizations = async (app, db) => {
	try {
		logger.info("Initializing performance optimizations...");

		// Set up cache
		const cache = setupRedisCache() || new MemoryCache(1000, 300000);

		// Create cache middleware
		const cacheMiddleware = createCacheMiddleware(cache);

		// Apply performance middlewares
		app.use("/api/business", queryOptimizationMiddleware);
		app.use("/api/business/fetch", cacheMiddleware(300000)); // 5 minute cache
		app.use("/api/business/admin", cacheMiddleware(120000)); // 2 minute cache for admin
		app.use("/api/business", requestDeduplicationMiddleware());

		// Initialize database indexes
		await initializeIndexes(db);

		// Schedule periodic optimizations
		if (process.env.NODE_ENV === "production") {
			// Optimize indexes weekly
			setInterval(async () => {
				try {
					await optimizeIndexes(db);
					logger.info("Scheduled index optimization completed");
				} catch (error) {
					logger.error("Scheduled optimization failed:", error);
				}
			}, 7 * 24 * 60 * 60 * 1000); // Weekly

			// Clean unused indexes monthly
			setInterval(async () => {
				try {
					await dropUnusedIndexes(db);
					logger.info("Unused index cleanup completed");
				} catch (error) {
					logger.error("Index cleanup failed:", error);
				}
			}, 30 * 24 * 60 * 60 * 1000); // Monthly
		}

		// Start query performance monitoring
		monitorQueryPerformance(db);

		logger.info("Performance optimizations initialized successfully");

		return { cache, cacheMiddleware };
	} catch (error) {
		logger.error(`Performance optimization setup failed: ${error.message}`);
		throw error;
	}
};

//----------------------------------------------------------------------
// Health check for performance systems
const performanceHealthCheck = (cache) => {
	return {
		cache: {
			type: cache instanceof MemoryCache ? "memory" : "redis",
			stats: cache.getStats ? cache.getStats() : "unavailable",
		},
		database: {
			poolSize: process.env.DB_POOL_SIZE || "default",
			connectionString: process.env.MONGODB_URI ? "configured" : "missing",
		},
		memory: {
			usage: process.memoryUsage(),
			uptime: process.uptime(),
		},
	};
};

module.exports = {
	optimizeDatabaseConnection,
	setupRedisCache,
	MemoryCache,
	createCacheMiddleware,
	queryOptimizationMiddleware,
	requestDeduplicationMiddleware,
	initializePerformanceOptimizations,
	performanceHealthCheck,
};
