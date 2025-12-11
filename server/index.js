require("dotenv").config({ path: "./config.env" });
const express = require("express");

const corsMiddleware = require("./config/cors");
const helmetMiddleware = require("./config/helmet");
const compressionMiddleware = require("./config/compression");
const rateLimitMiddleware = require("./config/rate-limit");
const requestMiddleware = require("./config/compression");
const expressSanitizer = require("./config/express-sanitizer");
const databaseSanitizer = require("./config/database-sanitizer");
const connectDB = require("./config/database");

//custom module imports and initialization
const app = express();
const errorHandler = require("./middleware/error/main");

//connect to database
connectDB();

//middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(requestMiddleware);
app.use(expressSanitizer);
app.use(databaseSanitizer);

//routes
app.use("/api/health", require("./routes/health"));
app.use("/api/user", require("./routes/user"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/routes", require("./routes/routes"));
app.use("/api/deliveries", require("./routes/deliveries"));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/performance", require("./routes/performance"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/sms", require("./routes/sms"));
app.use("/api/loans", require("./routes/loans"));
app.use("/api/airtime", require("./routes/airtime"));
app.use("/api/shop-wallet", require("./routes/shopWallet"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/rider", require("./routes/rider"));

//error middleware
app.use(errorHandler)

// port connections
module.exports = app;

require("./config/port")