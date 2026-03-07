function createOrderModel(db) {
  const collection = db.collection("carts");

  async function create(orderData) {
    const { usrId, prdQtyList = [] } = orderData;

    if (!usrId) {
      throw new Error("User Id is required");
    }

    const existing = await collection.findOne({ usrId });
    if (existing) {
      const error = new Error("Cart already exists");
      error.Cart = existing;
      throw error;
    }

    const now = new Date();

    const order = {
      usrId,
      prdQtyList,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  async function findByUsrId(usrId) {
    return collection.findOne({ usrId });
  }

  async function updateByUsrId(usrId, updateData) {
    const allowedFields = ["prdQtyList"];
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

    return collection.updateOne({ usrId }, { $set: filteredData });
  }

  return {
    create,
    findByUsrId,
    updateByUsrId,
  };
}

module.exports = createOrderModel;
