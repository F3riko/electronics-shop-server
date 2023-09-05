const express = require("express");
const router = express.Router();
const { clearRefreshToken } = require("../../../utils/accessTokenOp")

router.get("/", async function (req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await clearRefreshToken(refreshToken);
    }
    res.clearCookie("accessToken");
    res.clearCookie("openData");
    res.clearCookie("refreshToken");
    res.clearCookie("connect.sid");

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
