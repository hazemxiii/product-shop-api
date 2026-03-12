const { getUserById } = require("../controllers/UserController");
const { error } = require("../utils/logger");
const createProductModel = require("./Product");
function createOrderModel(db) {
  const collection = db.collection("carts");

  async function create(orderData) {
    console.log({ orderData });
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
    const order = { usrId, prdQtyList, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  async function findByUsrId(usrId) {
    return collection.findOne({ usrId });
  }

  async function findByUsrIdJoined(usrId) {
    return collection
      .aggregate([
        { $match: { usrId: usrId } },
        { $unwind: "$prdQtyList" },
        { $addFields: { prdIdObj: { $toObjectId: "$prdQtyList.prdId" } } },
        {
          $lookup: {
            from: "products",
            localField: "prdIdObj",
            foreignField: "_id",
            as: "prdQtyList.productDetails",
          },
        },
        {
          $addFields: {
            "prdQtyList.productDetails": {
              $arrayElemAt: ["$prdQtyList.productDetails", 0],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            usrId: { $first: "$usrId" },
            prdQtyList: { $push: "$prdQtyList" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
          },
        },
      ])
      .toArray();
  }

  async function updateByUsrId(orderData) {
    console.log({ orderData });
    const { usrId, prdQtyList } = orderData;
    if (!usrId || !prdQtyList) {
      throw new Error("User Id and Product Quantity List are required");
    }
    return collection.updateOne(
      { usrId },
      { $set: { prdQtyList, updatedAt: new Date() } },
    );
  }

  async function deleteByUsrId(userId) {
    // console.log({ orderData });
    // const { usrId, prdQtyList } = orderData;
    if (!userId) {
      throw new Error("User Id is required");
    }
    return collection.deleteOne({ usrId: userId });
  }
  return {
    create,
    findByUsrId,
    updateByUsrId,
    findByUsrIdJoined,
    deleteByUsrId,
  };
}
module.exports = createOrderModel;
