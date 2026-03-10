const { ObjectId } = require("mongodb");

function createReviewModel(db) {
  const collection = db.collection("reviews");

  const lookupStages = [
    {
      $match: {}, // Placeholder to be replaced
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        productObjectId: {
          $convert: {
            input: "$productId",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productObjectId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: {
        path: "$productDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        id: { $toString: "$_id" },
        user: {
          id: "$userDetails._id",
          name: "$userDetails.name",
          email: "$userDetails.email",
        },
        product: "$productDetails", // Keep full product details
      },
    },
    {
      $addFields: {
        "product.id": { $toString: "$productDetails._id" },
      },
    },
    {
      $project: {
        userDetails: 0,
        productDetails: 0,
        productObjectId: 0,
      },
    },
  ];

  async function create(reviewData) {
    const { name, rating, comment, productId, userId } = reviewData;
    const newReview = {
      name,
      rating: parseFloat(rating),
      comment,
      productId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newReview);
    return {
      ...newReview,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };
  }

  async function findById(id) {
    const stages = [...lookupStages];
    stages[0] = { $match: { _id: new ObjectId(id) } };
    const result = await collection.aggregate(stages).toArray();
    return result[0] || null;
  }

  async function findByProductId(productId) {
    const stages = [...lookupStages];
    stages[0] = { $match: { productId } };
    return collection.aggregate(stages).toArray();
  }

  async function findByUserProduct(userId, productId) {
    const stages = [...lookupStages];
    stages[0] = { $match: { userId, productId } };
    const result = await collection.aggregate(stages).toArray();
    return result[0] || null;
  }

  async function findByUserId(userId) {
    const stages = [...lookupStages];
    stages[0] = { $match: { userId } };
    return collection.aggregate(stages).toArray();
  }

  async function updateById(id, userId, updateData) {
    const allowedFields = ["name", "rating", "comment"];
    const filteredData = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }

    if (filteredData.rating !== undefined) {
      filteredData.rating = parseFloat(filteredData.rating);
    }

    filteredData.updatedAt = new Date().toISOString();

    return collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: filteredData },
    );
  }

  async function deleteById(id, userId) {
    return collection.deleteOne({ _id: new ObjectId(id), userId });
  }

  return {
    create,
    findById,
    findByProductId,
    findByUserId,
    updateById,
    deleteById,
    findByUserProduct,
  };
}

module.exports = createReviewModel;
