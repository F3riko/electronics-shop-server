const createNewOrder = require("../models/orderModel");

async function createOrderController(req, res, next) {
  try {
    const orderCartData = req.body;
    const userEmail = req.decodedToken;
    if (!orderCartData) {
      throw new Error("No order data was provided");
    }
    if (!userEmail) {
      throw new Error("Failure of user authentication");
    }
    const orderId = await createNewOrder(orderCartData, userEmail);

    if (!orderId) {
      throw new Error("Order creation failed");
    }

    res.json({ orderId });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

module.exports = { createOrderController };
