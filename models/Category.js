const { ObjectId } = require("mongodb");

function createCategoryModel(db) {
  const collection = db.collection("categories");

  async function create(categoryData) {
    const { name, description = "" } = categoryData;

    if (!name) {
      throw new Error("Category name is required");
    }

    const existing = await collection.findOne({ name });
    if (existing) {
      const error = new Error("Category already exists");
      error.category = existing;
      throw error;
    }

    const now = new Date();

    const category = {
      name,
      description,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  async function findAll() {
    return collection.find({}).toArray();
  }

  async function findById(id) {
    return collection.findOne({ _id: new ObjectId(id) });
  }

  async function updateById(id, updateData) {
    const allowedFields = ["name", "description"];
    const filteredData = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    filteredData.updatedAt = new Date();

    return collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredData },
    );
  }

  async function deleteById(id) {
    return collection.deleteOne({ _id: new ObjectId(id) });
  }

  return {
    create,
    findAll,
    findById,
    updateById,
    deleteById,
  };
}

module.exports = createCategoryModel;

function createProductModel(db) {
  const collection = db.collection("products");

  async function create(productData, sellerId) {
    const { name, price, description, image, category, stock = 0 } = productData;

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
    return collection.findOne({ _id: id });
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
      { _id: id, sellerId },
      { $set: filteredData },
    );
  }

  async function deleteById(id, sellerId) {
    return collection.deleteOne({ _id: id, sellerId });
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
