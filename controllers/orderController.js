const {
  createNewOrder,
  getOrderWithItems,
  getPickUpAddresses,
  processOrderPaymentSQL,
} = require("../models/orderModel");

const createOrderController = async (req, res) => {
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
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.query.id;
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

const getSelfpickUpAddresses = async (req, res) => {
  try {
    const addresses = await getPickUpAddresses();
    if (!addresses) {
      throw new Error("No addresses data was retrieved");
    }
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const processOrderPayment = async (req, res) => {
  try {
    const { userId, orderId, paymentId, addressId, deliveryMethod } = req.body;
    if (!userId || !orderId || !paymentId || !addressId || !deliveryMethod) {
      throw new Error("Missing required data");
    }
    await processOrderPaymentSQL(userId, orderId, paymentId, addressId, deliveryMethod)
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  createOrderController,
  getOrderById,
  getSelfpickUpAddresses,
  processOrderPayment,
};
