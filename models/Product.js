const { ObjectId } = require("mongodb");

function createProductModel(db) {
  const collection = db.collection("products");

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
    return await collection.findOne({ _id: new ObjectId(id) });
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

    return collection.find(query).toArray();
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
    return collection.find({ sellerId }).toArray();
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
