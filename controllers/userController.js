const userModel = require("../models/userModel");
// Temporary import
const { clearRefreshToken } = require("../utils/auth/tokenUtils");

async function authUser(req, res, next) {
  try {
    if (req.decodedToken) {
      const userData = req.decodedToken;
      res.json(userData);
    } else {
      req.status(403).json({ error: "Wrong credentials: access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function registerUser(req, res) {
  try {
    const queryText =
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";
    connection.query(
      queryText,
      [req.body.email, req.body.password, req.body.name],
      async (error, results) => {
        if (error) {
          throw error;
        }
        if (results.affectedRows === 1) {
          await userModel.getUser(req.body.email, req.body.password, res);
        } else {
          return res.json({ error: "User insertion failed" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
}

async function loginUser(req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Missing required data in request body" });
      return;
    }
    req.session.user = { email: req.body.email };
    await userModel.getUser(req.body.email, req.body.password, res);
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
// New user modal function -> don't import here clearRefreshToken
async function logOutUser(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await clearRefreshToken(refreshToken);
    }
    res.clearCookie("accessToken");
    res.clearCookie("openData");
    res.clearCookie("refreshToken");
    res.clearCookie("connect.sid");

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}

async function resetUserPassword(req, res, next) {
  try {
    if (req.body.resetToken && req.body.newUserPassowrd) {
      const { email, newPassword } = await userModel.resetPassword(
        req.body.resetToken,
        req.body.newUserPassowrd
      );
      await userModel.getUser(email, newPassword, res);
    } else {
      if (!req.body.userEmail) {
        res
          .status(400)
          .json({ error: "Missing required data in request body" });
        return;
      }
      const resetTokne = await userModel.resetMsg(req.body.userEmail);
      res.status(200).json(`user/passReset?resetToken=${resetTokne}`);
    }
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}

async function getUserProfile(req, res) {
  try {
    const userData = req.decodedToken;
    // Token decoded success here: getUser data and send back JSON
    const userProfileData = await userModel.getUserData(userData);
    res.json(userProfileData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function authOrderAccess(req, res, next) {
  try {
    const orderId = req.query.orderId;
    if (!orderId) {
      res.status(403).json({ error: "Missing data: order id" });
    }
    if (!req.decodedToken) {
      res
        .status(403)
        .json({ error: "Wrong credentials for user: access denied" });
    }

    const orderStatus = await verifyOrderForUser(req.decodedToken, orderId);
    res.json({ userOk: true, orderOk: orderStatus });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

// This one transfer to user's controller code
async function verifyOrderForUser(userEmail, orderId) {
  if (!userEmail || !orderId) {
    throw new Error("Missing data in order verification function");
  }
  const isOrder = await userModel.getOrderForEmail(userEmail, orderId);
  return isOrder;
}

function getOrderForEmail(userEmail, orderId) {
  return new Promise((resolve, reject) => {
    const checkOrderQuery = `
        SELECT 1
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        WHERE u.email = ? AND o.id = ?
      `;

    connection.query(checkOrderQuery, [userEmail, orderId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
}

function updateUserProfile(req, res) {
  // Handle user profile update logic using userModel functions
}

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  getUserProfile,
  updateUserProfile,
  resetUserPassword,
  authUser,
  verifyOrderForUser,
};
