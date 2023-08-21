const express = require("express");
const router = express.Router();
const getUser = require("../../../db-interactions/api-user/api-login-user");

router.post("/", async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Missing required data in request body" });
      return;
    }
    await getUser(req.body.email, req.body.password, res);
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

module.exports = router;
