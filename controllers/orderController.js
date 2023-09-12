const { createNewOrder, getOrderWithItems } = require("../models/orderModel");

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

const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.body.id;
    if (!orderId) {
      throw new Error("Missing required data");
    }
    const orderData = await getOrderWithItems(orderId);
    if (!orderData) {
      throw new Error("No order data was retrieved");
    }
    res.json(orderData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = { createOrderController, getOrderById };
