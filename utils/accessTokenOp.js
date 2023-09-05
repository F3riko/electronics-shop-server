const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const connection = require("../db-interactions/db-init");

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: "15m" });
}

function generateRefreshToken(userId) {
  const refreshToken = jwt.sign({}, secret, { expiresIn: "7d" });
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

async function clearRefreshToken(refreshToken) {
  connection.query(
    "DELETE FROM refresh_tokens WHERE token = ?",
    [refreshToken],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.affectedRows === 1) {
        return "Refresh token cleared";
      } else {
        throw new Error("Failed to clear refresh token");
      }
    }
  );
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyToken,
  clearRefreshToken,
};
