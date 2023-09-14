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
  getUsersOrderHistory
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


// middleware routes
router.get("/order", verifyTokenAndSession);
router.get("/", verifyTokenAndSession, authUser);

module.exports = router;
