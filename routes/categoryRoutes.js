const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} = require("../controllers/CategoryController");

const { requireAuth, requireSeller } = require("../middleware/auth");

// Public: list all categories
router.get("/", getAllCategories);

// Public: get single category
router.get("/:id", getCategoryById);

// Public: list products in a category
router.get("/:id/products", getProductsByCategory);

// Protected: create category (seller only)
router.post("/", requireAuth, requireSeller, createCategory);

// Protected: update category (seller only)
router.put("/:id", requireAuth, requireSeller, updateCategory);

// Protected: delete category (seller only)
router.delete("/:id", requireAuth, requireSeller, deleteCategory);

module.exports = router;

