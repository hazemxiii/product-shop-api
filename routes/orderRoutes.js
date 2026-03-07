const express = require("express");
const router = express.Router();

const {
  getOrderByUsrId,
  createOrder,
  updateOrder,
} = require("../controllers/OrderController");

const { requireAuth } = require("../middleware/auth");

// Public: get single category
router.get("/:usrId", requireAuth, getOrderByUsrId);

// Protected: create category (seller only)
router.post("/", requireAuth, createOrder);

// Protected: update category (seller only)
router.put("/:usrId", requireAuth, updateOrder);

module.exports = router;
