const express = require("express");
const router = express.Router();
const verifyTokenAndSession = require("../../../utils/userAuthMiddleware");
const verifyOrderForUser = require("../../../db-interactions/api-orders/api-order-access");

router.get("/", verifyTokenAndSession, async function (req, res, next) {
  try {
    const orderId = req.query.orderId;
    if (!orderId) {
      res.status(403).json({ error: "Missing data: order id" });
    }
    if (!req.decodedToken) {
      res
        .status(403)
        .json({ error: "Wrong credentials for user: access denied" });
    }

    const orderStatus = await verifyOrderForUser(req.decodedToken, orderId);
    res.json({ userOk: true, orderOk: orderStatus });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
