const express = require("express");
const router = express.Router();

const {
  getReviewsByProduct,
  getReviewsByUser,
  createReview,
  deleteReview,
} = require("../controllers/ReviewController");

const { requireAuth } = require("../middleware/auth");

router.get("/product/:productId", getReviewsByProduct);
router.get("/user/:userId", requireAuth, getReviewsByUser);
router.post("/", requireAuth, createReview);
router.delete("/:id", requireAuth, deleteReview);

module.exports = router;
