const express = require("express");
const router = express.Router();
const verifyTokenAndSession = require("../../../utils/userAuthMiddleware");

router.get("/", verifyTokenAndSession, async function (req, res, next) {
  try {
    if (req.decodedToken) {
      const userData = req.decodedToken;
      res.json(userData);
    } else {
      req.status(403).json({ error: "Wrong credentials: access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
