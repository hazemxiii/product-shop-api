const { getDb } = require("../config/connect_mongo");
const createCategoryModel = require("../models/Category");
const createProductModel = require("../models/Product");

// GET /categories
async function getAllCategories(req, res) {
  try {
    const db = getDb();
    const categoryModel = createCategoryModel(db);

    const categories = await categoryModel.findAll();

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving categories",
      error: error.message,
    });
  }
}

// GET /categories/:id
async function getCategoryById(req, res) {
  try {
    const db = getDb();
    const categoryModel = createCategoryModel(db);
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving category",
      error: error.message,
    });
  }
}

// POST /categories
async function createCategory(req, res) {
  try {
    const { name, description } = req.body || {};

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const db = getDb();
    const categoryModel = createCategoryModel(db);

    const category = await categoryModel.create({ name, description });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.message === "Category already exists") {
      return res.status(200).json({
        message: "Category already exists",
        category: error.category,
      });
    }

    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
}

// PUT /categories/:id
async function updateCategory(req, res) {
  try {
    const db = getDb();
    const categoryModel = createCategoryModel(db);

    const result = await categoryModel.updateById(req.params.id, req.body || {});

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const category = await categoryModel.findById(req.params.id);

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }
}

// DELETE /categories/:id
async function deleteCategory(req, res) {
  try {
    const db = getDb();
    const categoryModel = createCategoryModel(db);

    const result = await categoryModel.deleteById(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
}

// GET /categories/:id/products
async function getProductsByCategory(req, res) {
  try {
    const db = getDb();
    const categoryModel = createCategoryModel(db);
    const productModel = createProductModel(db);

    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Communicate with products using the category name
    const products = await productModel.findAll({ category: category.name });

    res.status(200).json({
      message: "Products retrieved successfully",
      category,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving products by category",
      error: error.message,
    });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
};
