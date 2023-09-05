var express = require("express");
const verifyTokenAndSession = require("../../../utils/userAuthMiddleware");
var router = express.Router();
const createNewOrder = require("../../../db-interactions/api-cart/api-create-order");

router.post("/", verifyTokenAndSession, async function (req, res, next) {
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
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
