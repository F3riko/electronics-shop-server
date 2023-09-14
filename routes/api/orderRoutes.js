const express = require("express");
const router = express.Router();
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");
const {
  createOrderController,
  getOrderById,
} = require("../../controllers/orderController");

router.post("/", verifyTokenAndSession, createOrderController);
router.get("/info", verifyTokenAndSession, getOrderById);

module.exports = router;
