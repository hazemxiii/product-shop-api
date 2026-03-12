const paypal = require("@paypal/paypal-server-sdk");
const uuidv4 = require("uuid");
const Client = paypal.Client;
const Environment = paypal.Environment;
const LogLevel = paypal.LogLevel;
const OrdersController = paypal.OrdersController;
const CheckoutPaymentIntent = paypal.CheckoutPaymentIntent;

/*
order = {
  paymentMethod: "paypal vs card vs cash on delivery",
  paymentStatus: "pending or confirmed or canceled or failed"
  userId: userId,
  productList: [{productId: prdId, quantity: quantity}]
  totalPrice: totalPrice,
  createdAt: now,
  updatedAt: now,
  }
  PaymentMethod: "Cash On Delivery" | "PayPal"
  */

function createPaymentModel(db) {
  const collection = db.collection("payments");

  paypal.HttpClientOptions;
  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.CLIENT_ID,
      oAuthClientSecret: process.env.CLIENT_SECRET,
    },

    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });
  const ordersController = new OrdersController(client);

  async function initPaymentPaypal(body) {
    const { userId, paymentMethod, order } = body;
    console.log({ order });

    const totalPrice = calcTotal(order);

    try {
      const orderRequestBody = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: totalPrice.toString(),
            },
          },
        ],
      };
      const { result, statusCode } = await ordersController.createOrder({
        body: orderRequestBody,
        prefer: "return=minimal",
      });
      const now = new Date();
      const prdQtyList = order.prdQtyList.map((prdQty) => {
        delete prdQty.productDetails;
        return prdQty;
      });

      const payment = {
        userId: userId,
        paymentMethod,
        paymentStatus: "pending",
        productList: prdQtyList,
        transactionId: uuidv4.v4(),
        totalPrice,
        createdAt: now,
        updatedAt: now,
      };
      console.log({ result });
      result.payment = payment;
      collection.insertOne(payment);
      return result;
    } catch (err) {
      throw new Error("Payment Failed");
    }
  }

  function calcTotal(order) {
    let total = 0;
    for (const prdQty of order.prdQtyList) {
      total += prdQty.quantity * prdQty.productDetails.price;
    }
    return total;
  }

  async function confirmOrderPaypal(body) {
    const { transactionId, orderId, status } = body;

    const { result } = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=minimal",
    });

    if (result.status === "COMPLETED") {
      const now = new Date();
      collection.updateOne(
        { transactionId },
        { $set: { paymentStatus: status, updatedAt: now } },
      );
      const payment = collection.findOne({ transactionId });
      return payment;
    }
  }

  async function initPaymentCash(body) {
    const { userId, paymentMethod, order } = body;
    console.log({ order });

    const totalPrice = calcTotal(order);

    try {
      const now = new Date();
      const prdQtyList = order.prdQtyList.map((prdQty) => {
        delete prdQty.productDetails;
        return prdQty;
      });

      const payment = {
        userId: userId,
        paymentMethod,
        paymentStatus: "pending",
        productList: prdQtyList,
        transactionId: uuidv4.v4(),
        totalPrice,
        createdAt: now,
        updatedAt: now,
      };

      collection.insertOne(payment);
      return { payment };
    } catch (err) {
      throw new Error("Payment Failed");
    }
  }

  function calcTotal(order) {
    let total = 0;
    for (const prdQty of order.prdQtyList) {
      total += prdQty.quantity * prdQty.productDetails.price;
    }
    return total;
  }

  async function confirmOrderCash(body) {
    const { transactionId, status } = body;

    const now = new Date();
    collection.updateOne(
      { transactionId },
      { $set: { paymentStatus: status, updatedAt: now } },
    );
    const payment = collection.findOne({ transactionId });
    return payment;
  }

  return {
    confirmOrderPaypal,
    initPaymentPaypal,
    initPaymentCash,
    confirmOrderCash,
  };
}
module.exports = createPaymentModel;
