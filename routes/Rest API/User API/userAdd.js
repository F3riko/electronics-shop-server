var express = require("express");
var router = express.Router();
const addUser = require("../../../db-interactions/api-user/api-add-user");
const getUser = require("../../../db-interactions/api-user/api-login-user");

const connection = require("../../../db-interactions/db-init");

router.post("/", async (req, res) => {
  try {
    const queryText = "INSERT INTO users (email, password) VALUES (?, ?)";
    connection.query(
      queryText,
      [req.body.email, req.body.password],
      async (error, results) => {
        if (error) {
          throw error;
        }
        if (results.affectedRows === 1) {
          await getUser(req.body.email, req.body.password, res);
        } else {
          return res.json({ error: "User insertion failed" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
