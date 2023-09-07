const express = require("express");
const router = express.Router();
const { verifyTokenCart } = require("../../controllers/sessiolnController");
const {
  getCart,
  addCartItem,
  deleteCartItem,
  getCartPriceWeight,
} = require("../../controllers/cartController");

// New model that WILL be used after refactoring
// Get cart
// router.get("/")
// Different updates according to request type
// router.post("")
// router.delete("")
// router.put("")

// root - cart
router.get("/", verifyTokenCart, getCart);
router.get("/add", addCartItem);
router.get("/delete", verifyTokenCart, deleteCartItem);
router.get("/getCartDetails", verifyTokenCart, getCartPriceWeight);

module.exports = router;
