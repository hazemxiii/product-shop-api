const { ObjectId } = require("mongodb");

function createProductModel(db) {
  const collection = db.collection("products");

  const categoryLookupStages = [
    {
      $addFields: {
        categoryObjectId: {
          $convert: {
            input: "$category",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryObjectId",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: {
        path: "$categoryDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        category: {
          id: "$categoryDetails._id",
          name: "$categoryDetails.name",
        },
      },
    },
    {
      $project: {
        categoryDetails: 0,
        categoryObjectId: 0,
      },
    },
  ];

  async function create(productData, sellerId) {
    const {
      name,
      price,
      description,
      image,
      category,
      stock = 0,
    } = productData;
    const newProduct = {
      name,
      price,
      description,
      image,
      category,
      stock,
      sellerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newProduct);
    return { ...newProduct, _id: result.insertedId };
  }

  async function findById(id) {
    const result = await collection
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        ...categoryLookupStages,
      ])
      .toArray();

    return result[0] || null;
  }

  async function findAll(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.sellerId) {
      query.sellerId = filters.sellerId;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }

    return collection
      .aggregate([{ $match: query }, ...categoryLookupStages])
      .toArray();
  }

  async function updateById(id, updateData, sellerId) {
    const allowedFields = [
      "name",
      "price",
      "description",
      "image",
      "category",
      "stock",
    ];
    const filteredData = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }

    filteredData.updatedAt = new Date();

    return collection.updateOne(
      { _id: new ObjectId(id), sellerId },
      { $set: filteredData },
    );
  }

  async function deleteById(id, sellerId) {
    return collection.deleteOne({ _id: new ObjectId(id), sellerId: sellerId });
  }

  async function findBySellerId(sellerId) {
    return collection
      .aggregate([{ $match: { sellerId } }, ...categoryLookupStages])
      .toArray();
  }

  return {
    create,
    findById,
    findAll,
    updateById,
    deleteById,
    findBySellerId,
  };
}

module.exports = createProductModel;
