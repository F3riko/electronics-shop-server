const express = require("express");
const router = express.Router();
const verifyTokenAndSession = require("../../../utils/userAuthMiddleware");
var session = require("express-session");

router.use(
  session({
    secret: "dsafl;jasd",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);

router.get("/", verifyTokenAndSession, async function (req, res, next) {
  try {
    const userData = req.decodedToken;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
