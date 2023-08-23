const connection = require("../db-init");
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
} = require("../../utils/accessTokenOp");
const UserNotFoundError = require("../../utils/customErrors");

async function getUser(email, password, res) {
  try {
    const results = await new Promise((resolve, reject) => {
      const queryText = `SELECT * FROM users WHERE email = ? AND password = ?`;
      connection.query(
        queryText,
        [email, password],
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching user getUser func:", err);
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
    const openData = JSON.stringify(userData.email);

    const accessToken = generateAccessToken(userData.id);
    const refreshToken = generateRefreshToken(userData.id);
    await saveRefreshToken(refreshToken, userData.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("openData", openData);
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
}

module.exports = getUser;
