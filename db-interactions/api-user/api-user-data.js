const connection = require("../db-init");
const { UserNotFoundError } = require("../../utils/customErrors");

async function getUserData(email) {
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
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = getUserData;
