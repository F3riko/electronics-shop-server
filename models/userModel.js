const connection = require("../config/database");
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyToken,
} = require("../utils/auth/tokenUtils");
const { UserNotFoundError } = require("../utils/auth/customErrors");

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

    // const accessToken = generateAccessToken(userData.id);
    const accessToken = generateAccessToken(userData.email);
    const refreshToken = generateRefreshToken(userData.id);
    await saveRefreshToken(refreshToken, userData.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("openData", openData);
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
}

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


module.exports = { getUser, resetMsg, resetPassword, getUserData };
