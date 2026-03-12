const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  togglePuaseUser,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require("../controllers/UserController");
const { requireAuth } = require("../middleware/auth");

// Get all users
router.get("/", getUsers);

// Get a single user by ID
router.get("/:id", getUserById);

// Create a new user
router.post("/", createUser);

// Update a user by ID
router.put("/:id", updateUser);

// Delete a user by ID
router.delete("/:id", deleteUser);

// Login endpoint
router.post("/login", loginUser);

// Toggle user pause
router.put("/pause/:id", togglePuaseUser);

// Get user favorites
router.get("/products/favorites", requireAuth, getFavorites);

// Add to favorites
router.put("/favorites/:id", requireAuth, addToFavorites);

// Remove from favorites
router.delete("/favorites/:id", requireAuth, removeFromFavorites);

module.exports = router;
