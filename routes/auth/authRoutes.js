const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logOutUser,
  resetUserPassword,
  getUserProfile,
  authUser,
  manageUserWishlist,
  getUsersWishList,
  resetUserPasswordMsg,
  getUsersOrderHistory,
  addNewAddress,
  getUserAddress,
  authOrderAccess
} = require("../../controllers/userController");
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");

// root - auth
router.get("/logout", logOutUser);
router.post("/register", registerUser);
router.post("/passReset", resetUserPassword);
router.post("/passResetToken", resetUserPasswordMsg)
router.post("/login", loginUser);
router.get("/profile", verifyTokenAndSession, getUserProfile);
router.post("/wishlist", verifyTokenAndSession, manageUserWishlist);
router.get("/wishlist", verifyTokenAndSession, getUsersWishList);
router.get("/order-gistory", verifyTokenAndSession, getUsersOrderHistory);
router.post("/address", verifyTokenAndSession, addNewAddress)
router.get("/address", verifyTokenAndSession, getUserAddress)


// middleware routes
router.get("/order", verifyTokenAndSession, authOrderAccess);
router.get("/", verifyTokenAndSession, authUser);

module.exports = router;
