const express = require("express");
const router = express.Router();
const resetMsg = require("../../../db-interactions/api-user/api-pass-reset-msg");
const resetPassword = require("../../../db-interactions/api-user/api-pass-reset");
const getUser = require("../../../db-interactions/api-user/api-login-user");

router.post("/", async function (req, res, next) {
  try {
    if (req.body.resetToken && req.body.newUserPassowrd) {
      const { email, newPassword } = await resetPassword(
        req.body.resetToken,
        req.body.newUserPassowrd
      );
      await getUser(email, newPassword, res);
    } else {
      if (!req.body.userEmail) {
        res
          .status(400)
          .json({ error: "Missing required data in request body" });
        return;
      }
      const resetTokne = await resetMsg(req.body.userEmail);
      res.status(200).json(`user/passReset?resetToken=${resetTokne}`);
    }
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

module.exports = router;
