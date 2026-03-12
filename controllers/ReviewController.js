const createReviewModel = require("../models/Review");
const { verifyToken } = require("../config/firebase_helper");
const { getDb } = require("../config/connect_mongo");

async function getReviewsByProduct(req, res) {
  try {
    const db = getDb();
    const reviewModel = createReviewModel(db);
    const { productId } = req.params;

    const reviews = await reviewModel.findByProductId(productId);
    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reviews",
      error: error.message,
    });
  }
}

async function getReviewsByUser(req, res) {
  try {
    const db = getDb();
    const reviewModel = createReviewModel(db);
    const { userId } = req.params;

    // Optional: make sure user is requesting their own reviews or is admin
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decodedUser = await verifyToken(token);
      if (decodedUser && decodedUser.uid !== userId) {
        // Just retrieving, might be allowed? If strict, return 403.
      }
    }

    const reviews = await reviewModel.findByUserId(userId);
    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reviews",
      error: error.message,
    });
  }
}

async function createReview(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Authorization token required" });
    const decodedUser = await verifyToken(token);
    if (!decodedUser) return res.status(401).json({ message: "Invalid token" });

    const requiredFields = ["productId"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const db = getDb();
    const reviewModel = createReviewModel(db);

    const oldReview = await reviewModel.findByUserProduct(
      decodedUser.uid,
      req.body.productId,
    );

    const reviewData = {
      rating: req.body.rating,
      comment: req.body.comment,
      productId: req.body.productId,
      userId: decodedUser.uid,
    };

    if (oldReview) {
      const result = await reviewModel.updateById(
        oldReview._id,
        decodedUser.uid,
        {
          rating: reviewData.rating || oldReview.rating,
          comment: reviewData.comment || oldReview.comment,
        },
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          message: "Review not found or you don't have permission to update it",
        });
      }
      const updatedReview = await reviewModel.findById(oldReview._id);
      return res.status(200).json({
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    const review = await reviewModel.create(reviewData);

    res.status(200).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating review",
      error: error.message,
    });
  }
}
async function deleteReview(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Authorization token required" });
    const decodedUser = await verifyToken(token);
    if (!decodedUser) return res.status(401).json({ message: "Invalid token" });

    const db = getDb();
    const reviewModel = createReviewModel(db);

    const { id } = req.params;
    const result = await reviewModel.deleteById(id, decodedUser.uid);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting review",
      error: error.message,
    });
  }
}

module.exports = {
  getReviewsByProduct,
  getReviewsByUser,
  createReview,
  deleteReview,
};
