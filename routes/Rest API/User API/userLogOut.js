const express = require("express");
const router = express.Router();
var session = require("express-session");
// Fix issues with sessions

router.get("/", async function (req, res, next) {
  try {
    console.log(req.cookies);
    const { accessToken, openData, refreshToken } = req.cookies;
    if (refreshToken && openData && accessToken) {
    } else {
      return res.status(400).json({ error: "Missing user data" });
    }
    // await clearRefreshToken(userId, refreshToken);
    res.cookie("accessToken", "", { expires: new Date(0) });
    res.cookie("openData", "", { expires: new Date(0) });
    res.cookie("refreshToken", "", { expires: new Date(0) });
    res.cookie("connect.sid", "", { expires: new Date(0) });
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;