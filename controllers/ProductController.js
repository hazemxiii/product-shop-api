const createProductModel = require("../models/Product");
const createUserModel = require("../models/User");
const { verifyToken } = require("../config/firebase_helper");
const { getDb } = require("../config/connect_mongo");

// Helper function to get user by ID
async function getUser(id) {
  const db = getDb();
  const userModel = createUserModel(db);
  return userModel.findById(id);
}

// Get all products with optional filters
async function getAllProducts(req, res) {
  try {
    const db = getDb();
    const productModel = createProductModel(db);

    const filters = {
      category: req.query.category,
      sellerId: req.query.sellerId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const products = await productModel.findAll(filters);

    res.status(200).json({
      message: "Products retrieved successfully",
      products,
      filters,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
    });
  }
}

// Get product by ID
async function getProductById(req, res) {
  try {
    const db = getDb();
    const productModel = createProductModel(db);
    const product = await productModel.findById(req.params.id);
    console.log(product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
}

// Create new product (requires seller role)
async function createProduct(req, res) {
  try {
    // Verify Firebase token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decodedUser = await verifyToken(token);
    if (!decodedUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database to check role
    const user = await getUser(decodedUser.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can create products" });
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "price",
      "description",
      "image",
      "category",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const db = getDb();
    const productModel = createProductModel(db);

    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      stock: parseInt(req.body.stock) || 0,
    };

    const product = await productModel.create(productData, user._id);

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
}

// Update product by ID (requires seller role and ownership)
async function updateProduct(req, res) {
  try {
    // Verify Firebase token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decodedUser = await verifyToken(token);
    if (!decodedUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database to check role
    const user = await getUser(decodedUser.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can update products" });
    }

    const db = getDb();
    const productModel = createProductModel(db);

    const { id } = req.params;
    const result = await productModel.updateById(id, req.body, user._id);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Product not found or you don't have permission to update it",
      });
    }

    const updatedProduct = await productModel.findById(id);
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
}

// Delete product by ID (requires seller role and ownership)
async function deleteProduct(req, res) {
  try {
    // Verify Firebase token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decodedUser = await verifyToken(token);
    if (!decodedUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database to check role
    const user = await getUser(decodedUser.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can delete products" });
    }

    const db = getDb();
    const productModel = createProductModel(db);

    const { id } = req.params;
    const result = await productModel.deleteById(id, user._id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Product not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
}

// Get products by seller ID
async function getProductsBySeller(req, res) {
  try {
    const db = getDb();
    const productModel = createProductModel(db);
    const { sellerId } = req.params;
    const products = await productModel.findBySellerId(sellerId);

    res.status(200).json({
      message: "Seller products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving seller products",
      error: error.message,
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};
