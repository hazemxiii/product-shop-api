require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToMongo } = require("./config/connect_mongo");
const logger = require("./utils/logger");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const port = process.env.PORT || 3000;

logger.info("Starting Product Shop API server...", {
  port,
  nodeEnv: process.env.NODE_ENV || "development",
});

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.debug(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// const corsOptions = {
//   origin: ["http://localhost:4200", "http://localhost:3000", "https://product-shop-api.com"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// };

app.use(cors());

app.get("/", (req, res) => {
  logger.info("Health check endpoint accessed");
  res.json({
    message: "Product Shop API is running",
    version: "1.0.0",
    status: "healthy",
  });
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error occurred", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });

  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

async function startServer() {
  try {
    logger.info("Connecting to MongoDB...");
    await connectToMongo();
    logger.success("MongoDB connected successfully");

    app.listen(port, () => {
      logger.success(`Server running on port ${port}`, {
        port,
        environment: process.env.NODE_ENV || "development",
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
}

startServer();

module.exports = app;
