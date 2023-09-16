const express = require("express");
const router = express.Router();
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");
const {
  createOrderController,
  getOrderById,
  getSelfpickUpAddresses,
  processOrderPayment,
} = require("../../controllers/orderController");

router.post("/", verifyTokenAndSession, createOrderController);
router.get("/info", verifyTokenAndSession, getOrderById);
router.get("/addresses", getSelfpickUpAddresses);
router.post("/payment", verifyTokenAndSession, processOrderPayment)

module.exports = router;
