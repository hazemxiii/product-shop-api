const express = require("express");
const router = express.Router();

const {
  createPayment,
  confirmPayment,
  confirmPaymentCash,
} = require("../controllers/PaymentController");

const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/paypal/initate-payment", requireAuth, createPayment);
router.post("/paypal/confirm-payment", requireAuth, confirmPayment);
router.post(
  "/paypal/confirm-payment-cash",
  requireAuth,
  requireAdmin,
  confirmPaymentCash,
);

module.exports = router;
