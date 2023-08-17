var express = require("express");
var router = express.Router();
const getUser = require("../db-interactions/api-user/api-login-user");

router.post("/", async function (req, res, next) {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400).json({ error: "Missing required data in request body" });
      return;
    }
    const user = await getUser(req.body.username, req.body.password);
    res.json(user);
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

module.exports = router;
