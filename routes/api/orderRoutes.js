const express = require("express");
const router = express.Router();
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");
const {
  createOrderController,
  getOrderById,
} = require("../../controllers/orderController");

router.post("/new", verifyTokenAndSession, createOrderController);
router.post("/orderinfo", getOrderById);

module.exports = router;
