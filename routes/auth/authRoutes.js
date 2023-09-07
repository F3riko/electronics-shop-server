const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logOutUser,
  resetUserPassword,
  getUserProfile,
  authUser,
} = require("../../controllers/userController");
const {
  verifyTokenAndSession,
} = require("../../controllers/sessiolnController");

// root - auth
router.get("/logout", logOutUser);
router.get("/register", registerUser);
// auth/resetpass/token -> create separate route for email
// router.get("/token")
// auth/resetpass/:token
router.post("/passReset", resetUserPassword);
router.post("/login", loginUser);
router.get("/profile", verifyTokenAndSession, getUserProfile);

// middleware routes
router.get("/order", verifyTokenAndSession);
router.get("/", verifyTokenAndSession, authUser);

module.exports = router;