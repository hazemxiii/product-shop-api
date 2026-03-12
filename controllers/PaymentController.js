const { getDb } = require("../config/connect_mongo");
const createOrderModel = require("../models/Order");
const createProductModel = require("../models/Product");
const createPaymentModel = require("../models/Payment");

/*
gets the userId and paymentMethod
returns {orderId, userId}
*/

async function createPayment(req, res) {
  const { userId, paymentMethod } = req.body;
  if (!userId || !paymentMethod) {
    return res.status(400).json({
      message: "User Id or Payment Method Is Not Found",
    });
  }
  try {
    const db = getDb();
    const orderModel = createOrderModel(db);
    const paymentModel = createPaymentModel(db);
    const order = await orderModel.findByUsrIdJoined(userId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    req.body.order = order[0];

    if (paymentMethod === "Cash On Delivery") {
      const { payment } = await paymentModel.initPaymentCash(req.body);

      return res.status(200).json({
        message: "Success",
        payment,
      });
    } else {
      const { id, payment } = await paymentModel.initPaymentPaypal(req.body);

      if (!id) {
        return res.status(400).json({
          message: "Payment Failed",
        });
      }
      return res.status(200).json({
        message: "Success",
        id,
        payment,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Order",
      error: error.message,
    });
  }
}
/* gets status and sets it in the db */

async function confirmPayment(req, res) {
  try {
    const { transactionId, orderId, status } = req.body;

    if (!transactionId || !orderId || !status) {
      throw new Error("Transaction Id, Order Id, and Status Are Required");
    }

    const db = getDb();
    const orderModel = createOrderModel(db);
    const productModel = createProductModel(db);
    const paymentModel = createPaymentModel(db);
    const payment = await paymentModel.confirmOrderPaypal(req.body);

    if (status === "done" && payment) {
      if (payment.productList) {
        for (const prdQty of payment.productList) {
          const product = await productModel.findById(prdQty.prdId);
          if (product && product.stock !== undefined) {
            const newStock = product.stock - prdQty.quantity;
            const updateResult = await productModel.updateById(
              prdQty.prdId,
              { stock: newStock },
              product.sellerId,
            );
            console.log({ updateResult });
          }
        }
      }
      const deleteResult = await orderModel.deleteByUsrId(
        payment.userId || payment.usrId,
      );
      console.log({ deleteResult });

      res.status(200).json({
        message: "Success",
        payment,
      });
    } else {
      res.status(400).json({
        message: "Fail",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Order",
      error: error.message,
    });
  }
}

async function confirmPaymentCash(req, res) {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      throw new Error("Transaction Id and Status Are Required");
    }

    const db = getDb();
    const orderModel = createOrderModel(db);
    const productModel = createProductModel(db);
    const paymentModel = createPaymentModel(db);
    const payment = await paymentModel.confirmOrderCash(req.body);

    if (status === "done" && payment) {
      if (payment.productList) {
        for (const prdQty of payment.productList) {
          const product = await productModel.findById(prdQty.prdId);
          if (product && product.stock !== undefined) {
            const newStock = product.stock - prdQty.quantity;
            const updateResult = await productModel.updateById(
              prdQty.prdId,
              { stock: newStock },
              product.sellerId,
            );
            console.log({ updateResult });
          }
        }
      }
      const deleteResult = await orderModel.deleteByUsrId(
        payment.userId || payment.usrId,
      );
      console.log({ deleteResult });

      res.status(200).json({
        message: "Success",
        payment,
      });
    } else {
      res.status(400).json({
        message: "Fail",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Order",
      error: error.message,
    });
  }
}

async function getPaymentsByUserId(req, res) {
  try {
    const userId = req.auth.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "User Id is required",
      });
    }

    const db = getDb();
    const paymentModel = createPaymentModel(db);
    const payments = await paymentModel.findByUserId(userId);

    res.status(200).json({
      message: "Success",
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving payments",
      error: error.message,
    });
  }
}

async function getAllPayments(req, res) {
  try {
    const db = getDb();
    const paymentModel = createPaymentModel(db);
    const payments = await paymentModel.findAll();

    res.status(200).json({
      message: "Success",
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving payments",
      error: error.message,
    });
  }
}

module.exports = {
  createPayment,
  confirmPayment,
  confirmPaymentCash,
  getPaymentsByUserId,
  getAllPayments,
};
