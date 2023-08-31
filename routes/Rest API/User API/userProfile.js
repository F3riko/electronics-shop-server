const express = require("express");
const router = express.Router();
const verifyTokenAndSession = require("../../../utils/userAuthMiddleware");
const getUserData = require("../../../db-interactions/api-user/api-user-data");

router.get("/", verifyTokenAndSession, async function (req, res, next) {
  try {
    const userData = req.decodedToken;
    // Token decoded success here: getUser data and send back JSON
    const userProfileData = await getUserData(userData);
    res.json(userProfileData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
