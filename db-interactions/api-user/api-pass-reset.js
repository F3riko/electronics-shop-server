const connection = require("../db-init");
const UserNotFoundError = require("../../utils/customErrors");
const { verifyToken } = require("../../utils/accessTokenOp");

async function resetPassword(resetToken, newPassword) {
  try {
    const tokenData = await verifyToken(resetToken).sub;
    if (tokenData) {
      const results = await new Promise((resolve, reject) => {
        const queryText = `SELECT * FROM users WHERE email = ?`;
        connection.query(
          queryText,
          [tokenData],
          function (err, results, fields) {
            if (err) {
              console.error("Error fetching user 1:", err);
              reject(err);
              return;
            }
            if (results.length == 0) {
              reject(new UserNotFoundError("No user found"));
              return;
            } else {
              resolve(results);
            }
          }
        );
      });
      const userData = results[0];
      const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;
      const updateResults = await new Promise((resolve, reject) => {
        connection.query(
          updateQuery,
          [newPassword, userData.id],
          function (err, results, fields) {
            if (err) {
              console.error("Error updating password:", err);
              reject(err);
              return;
            }
            console.log("Password updated successfully");
            resolve(results);
          }
        );
      });
      if (updateResults.affectedRows === 1) {
        return { email: userData.email, newPassword };
      } else {
        throw new Error("Problem with updating results");
      }
    } else {
      throw new Error("Token verification failed");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = resetPassword;
