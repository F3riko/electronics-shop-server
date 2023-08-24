const express = require("express");
const router = express.Router();
const getUser = require("../../../db-interactions/api-user/api-login-user");
const counter = require("../../../utils/counter");

router.post("/", async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Missing required data in request body" });
      return;
    }
    req.session.user = { email: req.body.email };
    await getUser(req.body.email, req.body.password, res);
  } catch (error) {
    console.log(error);
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

// Counter practice
router.post("/increment", (req, res) => {
  counter("increase", req, res);
});

router.post("/decrement", (req, res) => {
  counter("decrese", req, res);
});

module.exports = router;
