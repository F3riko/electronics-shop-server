const express = require("express");
const router = express.Router();
const getUser = require("../../../db-interactions/api-user/api-login-user");
var session = require("express-session");

// Session middleware
router.use(
  session({
    // secret: process.env.SESSION_SECRET,
    secret: "dsafl;jasd",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);

router.post("/", async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Missing required data in request body" });
      return;
    }
    req.session.user = { email: req.body.email };
    await getUser(req.body.email, req.body.password, res);
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

// Counter practice
router.post("/increment", (req, res) => {
  if (req.session) {
    if (req.session.cookie.maxAge > 0) {
      if (!req.session.counter) {
        req.session.counter = 0;
      }
      req.session.counter++;
      req.session.touch();
      res.json({ counter: req.session.counter });
    } else {
      res.status(401).json({ error: "Unauthorized: Session expired" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized: Session not found" });
  }
});

router.post("/decrement", (req, res) => {
  if (req.session) {
    if (req.session.cookie.maxAge > 0) {
      if (!req.session.counter) {
        req.session.counter = 0;
      }
      req.session.counter--;
      req.session.touch();
      res.json({ counter: req.session.counter });
    } else {
      res.status(401).json({ error: "Unauthorized: Session expired" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized: Session not found" });
  }
});

module.exports = router;
