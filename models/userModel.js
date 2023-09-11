const connection = require("../config/database");
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyToken,
} = require("../utils/auth/tokenUtils");
const { UserNotFoundError } = require("../utils/auth/customErrors");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

async function getUser(email, password, res) {
  try {
    const queryText = `SELECT * FROM users WHERE email = ? AND password = ?`;
    const results = await query(queryText, [email, password]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }

    const userData = results[0];
    // const openData = JSON.stringify(userData.email);
    const openData = JSON.stringify({ id: userData.id, name: userData.name });

    const accessToken = generateAccessToken(userData.email);
    const refreshToken = generateRefreshToken(userData.id);
    await saveRefreshToken(refreshToken, userData.id);
    const wishlist = await getUserWishListSQL(userData.id);

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
    res.cookie("wishlist", wishlist, {
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
    const queryText = `SELECT * FROM users WHERE email = ?`;
    const results = await query(queryText, [email]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }

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
      const queryText = `SELECT * FROM users WHERE email = ?`;
      const results = await query(queryText, [tokenData]);

      if (results.length === 0) {
        throw new UserNotFoundError("No user found");
      }

      const userData = results[0];
      const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;
      const updateResults = await query(updateQuery, [
        newPassword,
        userData.id,
      ]);

      if (updateResults.affectedRows === 1) {
        return { email: userData.email, newPassword };
      } else {
        throw new Error("Problem with updating results");
      }
    } else {
      throw new Error("Token verification failed");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

async function getUserData(email) {
  try {
    const queryText = `SELECT * FROM users WHERE email = ?`;
    const results = await query(queryText, [email]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }

    return results;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

const addItemToWishList = async (userId, productId) => {
  try {
    const addQueryText =
      "INSERT IGNORE INTO wishlist (user_id, item_id) VALUES (?, ?)";
    const result = await query(addQueryText, [userId, productId]);
    if (result.affectedRows === 0) {
      throw new Error("Item is already in the wishlist.");
    }
    return;
  } catch (error) {
    throw error;
  }
};

const deleteItemFromWishlist = async (userId, productId) => {
  try {
    const deleteQueryText =
      "DELETE FROM wishlist WHERE user_id = ? AND item_id = ?";
    const result = await query(deleteQueryText, [userId, productId]);
    if (result.affectedRows === 0) {
      throw new Error("Item was not found in the wishlist");
    }
    return;
  } catch (error) {
    throw error;
  }
};

const getUserWishListSQL = async (userId) => {
  try {
    const queryText = "SELECT item_id FROM wishlist WHERE user_id = ?";
    const result = await query(queryText, [userId]);
    return result.map((row) => row.item_id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUser,
  resetMsg,
  resetPassword,
  getUserData,
  getUserWishListSQL,
  deleteItemFromWishlist,
  addItemToWishList,
};
