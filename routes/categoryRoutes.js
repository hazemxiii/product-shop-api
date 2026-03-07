const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
} = require("../controllers/ProductController");

const { requireAuth, requireSeller } = require("../middleware/auth");

// Get all products
router.get("/", getAllProducts);

// Get products by seller (keep public for now)
router.get("/seller/:sellerId", getProductsBySeller);

// Get a single product by ID
router.get("/:id", getProductById);

// Create a new product (seller only)
router.post("/", requireAuth, requireSeller, createProduct);

// Update a product by ID (seller only)
router.put("/:id", requireAuth, requireSeller, updateProduct);

// Delete a product by ID (seller only)
router.delete("/:id", requireAuth, requireSeller, deleteProduct);

module.exports = router;
