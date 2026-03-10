const createUserModel = require("../models/User");
const { getDb } = require("../config/connect_mongo");
const logger = require("../utils/logger");
const { verifyToken } = require("../config/firebase_helper");

// Get all users
async function getUsers(req, res) {
  try {
    logger.info("Getting all users", { query: req.query });

    const [_, token] = req.headers.authorization.split(" ");
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const db = getDb();
    const userModel = createUserModel(db);
    const user = await userModel.findById(decoded.uid);
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can perform this action" });
    }

    const users = await userModel.findAll();

    logger.success("Users retrieved successfully", { count: users.length });
    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    logger.error("Error retrieving users", { error: error.message });
    res.status(500).json({
      message: "Error retrieving users",
      error: error.message,
    });
  }
}

async function togglePuaseUser(req, res) {
  try {
    const { id } = req.params;
    logger.info("Toggling user pause", { id });
    const [_, token] = req.headers.authorization.split(" ");
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const db = getDb();
    const userModel = createUserModel(db);
    const admin = await userModel.findById(decoded.uid);
    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can perform this action" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      logger.warn("User not found", { id });
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await userModel.updateById(id, {
      isPaused: req.body.isPaused,
    });
    logger.success("User paused successfully", {
      id,
      isPaused: req.body.isPaused,
    });
    res.status(200).json({
      message: "User paused successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error pausing user", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({
      message: "Error pausing user",
      error: error.message,
    });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    logger.info("Getting user by ID", { id });

    const db = getDb();
    const userModel = createUserModel(db);
    const user = await userModel.findById(id);

    if (!user) {
      logger.warn("User not found", { id });
      return res.status(404).json({
        message: "User not found",
      });
    }

    logger.success("User retrieved successfully", { id, email: user.email });
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    logger.error("Error retrieving user", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({
      message: "Error retrieving user",
      error: error.message,
    });
  }
}

// Create new user
async function createUser(req, res) {
  try {
    const { id, name, email, role } = req.body;
    logger.info("Creating new user", { id, name, email, role });

    // Validation
    if (!id || !name || !email) {
      logger.warn("Missing required fields for user creation", {
        id,
        name,
        email,
      });
      return res.status(400).json({
        message: "Missing required fields: id, name, email",
      });
    }

    if (role && !["user", "seller"].includes(role)) {
      logger.warn("Invalid role provided", { role });
      return res.status(400).json({
        message: "Invalid role. Must be 'user' or 'seller'",
      });
    }

    const db = getDb();
    const userModel = createUserModel(db);
    const userData = { id, name, email, role };
    const user = await userModel.create(userData);

    logger.success("User created successfully", { id, email, role });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error.message === "User already exists") {
      // Idempotent create: if the user already exists, treat it as success
      logger.info("User already exists, treating as success", {
        userId: req.body.id,
        email: req.body.email,
      });
      return res.status(200).json({
        message: "User already exists",
        user: error.user,
      });
    }

    logger.error("Error creating user", {
      error: error.message,
      userData: { id: req.body.id, email: req.body.email },
    });
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
}

// Update user
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    logger.info("Updating user", { id, updateData });

    const db = getDb();
    const userModel = createUserModel(db);

    // Validation
    const allowedFields = ["name", "email", "address"];
    const invalidFields = Object.keys(updateData).filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      logger.warn("Invalid fields for user update", { id, invalidFields });
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }

    const result = await userModel.updateById(id, updateData);

    if (result.matchedCount === 0) {
      logger.warn("User not found for update", { id });
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await userModel.findById(id);
    logger.success("User updated successfully", {
      id,
      updatedFields: Object.keys(updateData),
    });
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error updating user", {
      error: error.message,
      userId: req.params.id,
      updateData: req.body,
    });
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    logger.info("Deleting user", { id });

    const db = getDb();
    const userModel = createUserModel(db);
    const result = await userModel.deleteById(id);

    if (result.deletedCount === 0) {
      logger.warn("User not found for deletion", { id });
      return res.status(404).json({
        message: "User not found",
      });
    }

    logger.success("User deleted successfully", { id });
    res.status(200).json({
      message: "User deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error("Error deleting user", {
      error: error.message,
      userId: req.params.id,
    });
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
}

// Login user
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    logger.info("User login attempt", { email });

    if (!email || !password) {
      logger.warn("Missing credentials for login", { email });
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // For now, just find user by email (in real app, you'd verify password)
    const db = getDb();
    const userModel = createUserModel(db);
    const users = await userModel.findAll();
    const user = users.find((u) => u.email === email);

    if (!user) {
      logger.warn("Login failed - user not found", { email });
      return res.status(404).json({
        message: "User not found",
      });
    }

    logger.success("User login successful", {
      userId: user._id,
      email,
      role: user.role,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error during login", {
      error: error.message,
      email: req.body.email,
    });
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  togglePuaseUser,
};
