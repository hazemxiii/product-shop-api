const express = require("express");
const router = express.Router();

const {
  getOrderByUsrId,
  createOrder,
  updateOrder,
  getOrderByUsrIdJoined,
} = require("../controllers/OrderController");

const { requireAuth } = require("../middleware/auth");

// Public: get single category
router.get("/:usrId", requireAuth, getOrderByUsrId);

// Public: get single category
router.get("/joined/:usrId", requireAuth, getOrderByUsrIdJoined);

// Protected: create category (seller only)
router.post("/", requireAuth, createOrder);

// Protected: update category (seller only)
router.put("/", requireAuth, updateOrder);

module.exports = router;
