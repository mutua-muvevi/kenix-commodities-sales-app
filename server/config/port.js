// const cluster = require("cluster");
// const os = require("os");
// const http = require("http");
// const app = require("../index");
// const logger = require("../utils/logger");

// // Number of worker processes (limit to the number of CPUs or environment variable)
// const numCPUs = Math.min(os.cpus().length, parseInt(process.env.MAX_WORKERS) || 4);

// // Restart configuration
// let lastRestartTime = Date.now();
// let restartCount = 0;
// const MAX_RESTARTS_IN_WINDOW = 5;
// const RESTART_WINDOW = 5 * 60 * 1000; // 5 minutes

// if (cluster.isPrimary) {
// 	logger.info(`Primary ${process.pid} is running`);

// 	// Fork workers
// 	for (let i = 0; i < numCPUs; i++) {
// 		cluster.fork();
// 	}

// 	// Handle worker exit
// 	cluster.on("exit", (worker, code, signal) => {
// 		logger.error(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);

// 		const now = Date.now();

// 		// Check restart conditions
// 		if (now - lastRestartTime < RESTART_WINDOW) {
// 			restartCount += 1;
// 			if (restartCount > MAX_RESTARTS_IN_WINDOW) {
// 				logger.error("Max restarts reached. Not starting a new worker.");
// 				return;
// 			}
// 		} else {
// 			restartCount = 0; // Reset count outside of restart window
// 		}

// 		// Apply a dynamic delay before restarting
// 		const dynamicDelay = parseInt(process.env.RESTART_DELAY) || 1000;
// 		const delay = dynamicDelay + restartCount * 1000;
// 		lastRestartTime = now;

// 		setTimeout(() => {
// 			logger.info("Starting a new worker");
// 			cluster.fork();
// 		}, delay);
// 	});
// } else {
// 	// Worker logic
// 	const server = http.createServer(app).listen(process.env.PORT, () => {
// 		logger.info(`Worker ${process.pid} listening on port ${process.env.PORT}`);
// 	});

// 	// Monitor memory usage
// 	setInterval(() => {
// 		const memoryLimit = 500 * 1024 * 1024; // 500 MB

// 		if (process.memoryUsage().heapUsed > memoryLimit) {
// 			logger.error(`Worker ${process.pid} exceeded memory limit`);
// 			process.exit(1); // Exit to allow restart
// 		}
// 	}, 5000);

// 	// Graceful shutdown handler
// 	const shutdown = (server) => {
// 		server.close(() => {
// 			logger.info(`Worker ${process.pid} closed remaining connections`);
// 			process.exit(0);
// 		});

// 		// Force shutdown after a timeout
// 		setTimeout(() => {
// 			logger.error(
// 				`Worker ${process.pid} could not close connections in time, forcefully shutting down`,
// 			);
// 			process.exit(1);
// 		}, 10000); // 10 seconds timeout
// 	};

// 	// Error handling
// 	process.on("unhandledRejection", (error) => {
// 		logger.error(`Unhandled Rejection: ${error}`);
// 		shutdown(server);
// 	});

// 	process.on("uncaughtException", (error) => {
// 		logger.error(`Uncaught Exception: ${error}`);
// 		shutdown(server);
// 	});

// 	// Signal handlers for graceful shutdown
// 	process.on("SIGTERM", () => {
// 		logger.info("SIGTERM received, shutting down gracefully");
// 		shutdown(server);
// 	});

// 	process.on("SIGINT", () => {
// 		logger.info("SIGINT received, shutting down gracefully");
// 		shutdown(server);
// 	});
// }

const http = require("http");
const app = require("../index");
const logger = require("../utils/logger");
const { initializeWebSocket } = require("../websocket");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Initialize WebSocket server
try {
	initializeWebSocket(server);
	logger.info("WebSocket server initialized successfully");
} catch (error) {
	logger.error("Failed to initialize WebSocket server:", error);
}

server.listen(PORT, () => {
	logger.info(`Server is listening on port ${PORT}`);
	logger.info("WebSocket server is ready for connections");
});

// Graceful shutdown
const shutdown = () => {
	server.close(() => {
		logger.info("Server closed remaining connections");
		process.exit(0);
	});

	// Force shutdown after a timeout
	setTimeout(() => {
		logger.error("Forcefully shutting down the server");
		process.exit(1);
	}, 10000); // 10 seconds timeout
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", (error) => {
	logger.error(`Uncaught Exception: ${error.message}`);
	shutdown();
});
process.on("unhandledRejection", (error) => {
	logger.error(`Unhandled Rejection: ${error.message}`);
	shutdown();
});
