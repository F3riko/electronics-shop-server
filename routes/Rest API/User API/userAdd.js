var express = require("express");
var router = express.Router();
const addUser = require("../../../db-interactions/api-user/api-add-user");

const connection = require("../../../db-interactions/db-init");

router.post("/", (req, res) => {
  console.log(req.body);

  const queryText = "INSERT INTO users (email, password) VALUES (?, ?)";
  connection.query(
    queryText,
    [req.body.email, req.body.password],
    (error, results) => {
      console.log(error, results);
      if (results.affectedRows === 1) {
        // Return user auth - another query
        return res.json({ status: 200 });
      } else {
        return res.json({ error: error });
      }
    }
  );
});

// router.post("/", async function (req, res, next) {
//   try {
//     if (!req.body.email || !req.body.password || !req.body.recaptchaResponse) {
//       res.status(400).json({ error: "Missing required data in request body" });
//       return;
//     }
//     await addUser(
//       req.body.email,
//       req.body.password,
//       req.body.recaptchaResponse
//     );
//     res.status(200);
//   } catch (error) {
//     if (error.name === "InvalidEmailError") {
//       res.status(422).json({ error: "Invalid email format" });
//     } else {
//       res.status(500).json({ error: "An error occurred" });
//     }
//   }
// });

module.exports = router;
