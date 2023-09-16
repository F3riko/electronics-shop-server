const express = require("express");
const router = express.Router();
const { verifyTokenCart } = require("../../controllers/sessiolnController");
const {
  getCart,
  addCartItem,
  deleteCartItem,
  getCartPriceWeight,
  clearCart,
} = require("../../controllers/cartController");

// root - cart
router.get("/", verifyTokenCart, getCart);
router.post("/", verifyTokenCart, addCartItem);
router.delete("/", verifyTokenCart, deleteCartItem);
router.get("/details", verifyTokenCart, getCartPriceWeight);
router.delete("/clear", verifyTokenCart, clearCart)

module.exports = router;
