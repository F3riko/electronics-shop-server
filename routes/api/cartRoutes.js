const express = require("express");
const router = express.Router();
const { verifyTokenCart } = require("../../controllers/sessiolnController");
const {
  getCart,
  addCartItem,
  deleteCartItem,
  getCartPriceWeight,
} = require("../../controllers/cartController");

// root - cart
router.get("/", verifyTokenCart, getCart);
router.post("/", verifyTokenCart, addCartItem);
router.delete("/", verifyTokenCart, deleteCartItem);
router.get("/details", verifyTokenCart, getCartPriceWeight);

module.exports = router;
