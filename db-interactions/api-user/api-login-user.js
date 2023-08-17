class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

const connection = require("../db-init");

async function getUser(username, password) {
  try {
    const results = await new Promise((resolve, reject) => {
      const queryText = `SELECT * FROM users WHERE username = ? AND password = ?`;
      connection.query(
        queryText,
        [username, password],
        function (err, results, fields) {
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
        }
      );
    });
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = getUser;
