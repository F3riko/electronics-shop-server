const connection = require("../db-init");
const { generateAccessToken } = require("../../utils/accessTokenOp");
const UserNotFoundError = require("../../utils/customErrors");

async function resetMsg(email) {
  try {
    const results = await new Promise((resolve, reject) => {
      const queryText = `SELECT * FROM users WHERE email = ?`;
      connection.query(queryText, [email], function (err, results, fields) {
        if (err) {
          console.error("Error fetching user:", err);
          reject(err);
          return;
        }
        if (results.length == 0) {
          reject(new UserNotFoundError("No user found"));
          return;
        } else {
          resolve(results);
        }
      });
    });
    const userData = results[0];
    if (userData) {
      const resetToken = generateAccessToken(email);
      return resetToken;
    } else {
      throw new Error("No user data");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = resetMsg;
