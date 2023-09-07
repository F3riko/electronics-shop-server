const express = require("express");
const router = express.Router();
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");
const { createOrderController } = require("../../controllers/orderController");

router.post("/new", verifyTokenAndSession, createOrderController);

module.exports = router;
