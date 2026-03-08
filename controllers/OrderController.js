const { getDb } = require("../config/connect_mongo");
const createOrderModel = require("../models/Order");

// GET /orders/:usrId
async function getOrderByUsrId(req, res) {
  try {
    const db = getDb();
    const orderModel = createOrderModel(db);
    const order = await orderModel.findByUsrId(req.params.usrId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Order",
      error: error.message,
    });
  }
}

// GET /orders/:usrId
async function getOrderByUsrIdJoined(req, res) {
  try {
    const db = getDb();
    const orderModel = createOrderModel(db);
    const order = await orderModel.findByUsrIdJoined(req.params.usrId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      order: order[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Order",
      error: error.message,
    });
  }
}

// POST /orders
async function createOrder(req, res) {
  try {
    const { usrId, prdQtyList = [] } = req.body || {};

    if (!usrId) {
      return res.status(400).json({
        message: "User Id is required",
      });
    }

    const db = getDb();
    const orderModel = createOrderModel(db);

    const order = await orderModel.create({ usrId, prdQtyList });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (error.message === "Order already exists") {
      return res.status(200).json({
        message: "Order already exists",
        order: error.order,
      });
    }

    res.status(500).json({
      message: "Error creating Order",
      error: error.message,
    });
  }
}

// PUT /orders/:usrId
async function updateOrder(req, res) {
  try {
    const { usrId, prdQtyList } = req.body || {};
    const db = getDb();
    const orderModel = createOrderModel(db);

    const result = await orderModel.updateByUsrId({ usrId, prdQtyList });

    console.log({ result });

    // if (result.matchedCount === 0) {
    //   return res.status(404).json({
    //     message: "Order not found",
    //   });
    // }

    const order = await orderModel.findByUsrIdJoined(usrId);

    res.status(200).json({
      message: "Order updated successfully",
      order: order[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
    });
  }
}

module.exports = {
  getOrderByUsrId,
  createOrder,
  updateOrder,
  getOrderByUsrIdJoined,
};
