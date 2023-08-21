const jwt = require("jsonwebtoken");
const config = require("../config");
const connection = require("../db-interactions/db-init");

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, config.secretKey, { expiresIn: "15m" });
}

function generateRefreshToken(userId) {
  const refreshToken = jwt.sign({}, config.secretKey, { expiresIn: "7d" });
  return refreshToken;
}

async function saveRefreshToken(refreshToken, userId) {
  connection.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
    [userId, refreshToken],
    async (error, results) => {
      if (error) {
        throw error;
      }
      if (results.affectedRows === 1) {
        return refreshToken;
      } else {
        throw new Error("Failed");
      }
    }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
};
