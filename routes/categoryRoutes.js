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

const { requireAuth, requireAdmin } = require("../middleware/auth");

// Public: list all categories
router.get("/", getAllCategories);

// Public: get single category
router.get("/:id", getCategoryById);

// Public: list products in a category
router.get("/:id/products", getProductsByCategory);

// Protected: create category (admin only)
router.post("/", requireAuth, requireAdmin, createCategory);

// Protected: update category (admin only)
router.put("/:id", requireAuth, requireAdmin, updateCategory);

// Protected: delete category (admin only)
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

module.exports = router;

