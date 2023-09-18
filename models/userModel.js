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

const checkUserQuery = "SELECT 1 FROM users WHERE email = ?";
const insertUserQuery =
  "INSERT INTO users (email, name, password) VALUES (?, ?, ?)";
const getUserQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;
const getUserByEmailQuery = `SELECT * FROM users WHERE email = ?`;
const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;
const addToWishlistQuery =
  "INSERT IGNORE INTO wishlist (user_id, item_id) VALUES (?, ?)";
const deleteFromWishlistQuery =
  "DELETE FROM wishlist WHERE user_id = ? AND item_id = ?";
const getWishlistQuery = "SELECT item_id FROM wishlist WHERE user_id = ?";
const getOrderHistoryQuery = `
    SELECT order_date, id
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
  `;
const getOrderByEmailAndIdQuery = `
SELECT 1
FROM orders o
INNER JOIN users u ON u.id = o.user_id
WHERE u.email = ? AND o.id = ? AND o.status = "CR";
`;
const addNewAddressQuery =
  "INSERT INTO addresses (name, surname, email, phone, zip, city, street, address, additional_info, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
const getUserAddressesQuery = "SELECT * FROM addresses WHERE user_id = ?";
const deleteUserAddressQuery = `
DELETE FROM addresses 
WHERE id = ? AND user_id = ?;
`;
const verifyReviewRightQuery = `
      SELECT CASE
        WHEN EXISTS (
          SELECT 1
          FROM orders o
          INNER JOIN orders_items oi ON o.id = oi.order_id
          WHERE o.user_id = ? AND oi.item_id = ?
        ) AND NOT EXISTS (
          SELECT 1
          FROM reviews r
          WHERE r.user_id = ? AND r.item_id = ?
        ) THEN 1
        ELSE 0
      END AS can_post_review;
    `;

const userExists = async (email) => {
  try {
    const existingUser = await query(checkUserQuery, [email]);
    if (existingUser.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const addNewUser = async (email, password, name) => {
  try {
    const existingUser = await userExists(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const result = await query(insertUserQuery, [email, name, password]);
    if (result.affectedRows === 1) {
      return true;
    } else {
      throw new Error("User creation failed");
    }
  } catch (error) {
    throw error;
  }
};

const getUser = async (email, password, res) => {
  try {
    const results = await query(getUserQuery, [email, password]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }

    const userData = results[0];
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
};

const resetMsg = async (email) => {
  try {
    const results = await query(getUserByEmailQuery, [email]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }
    const userData = results[0];
    if (!userData) {
      throw new Error("User data hasn't been retrieved");
    }
    const resetToken = generateAccessToken(email);
    return resetToken;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (resetToken, newPassword) => {
  try {
    const tokenData = await verifyToken(resetToken).sub;
    if (!tokenData) {
      throw new Error("Token verification failed");
    }
    const results = await query(getUserByEmailQuery, [tokenData]);

    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }
    const userData = results[0];

    const updateResults = await query(updateQuery, [newPassword, userData.id]);
    if (updateResults.affectedRows === 1) {
      return { email: userData.email, newPassword };
    } else {
      throw new Error("Problem with updating results");
    }
  } catch (error) {
    throw error;
  }
};

const getUserData = async (email) => {
  try {
    const results = await query(getUserByEmailQuery, [email]);
    if (results.length === 0) {
      throw new UserNotFoundError("No user found");
    }
    return results;
  } catch (error) {
    throw error;
  }
};

const addItemToWishList = async (userId, productId) => {
  try {
    const result = await query(addToWishlistQuery, [userId, productId]);
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
    const result = await query(deleteFromWishlistQuery, [userId, productId]);
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
    const result = await query(getWishlistQuery, [userId]);
    return result.map((row) => row.item_id);
  } catch (error) {
    throw error;
  }
};

const getUserOrderHistorySQL = async (userId) => {
  try {
    const result = await query(getOrderHistoryQuery, [userId]);
    return result;
  } catch (error) {
    throw error;
  }
};

const getOrderForEmail = async (userEmail, orderId) => {
  try {
    const result = await query(getOrderByEmailAndIdQuery, [userEmail, orderId]);
    if (result.length === 0) {
      throw new Error("Order info doesn't match or order was paid");
    }
    return;
  } catch (error) {
    throw error;
  }
};

const addNewAddressSQL = async (userId, addressObj) => {
  try {
    const result = await query(addNewAddressQuery, [
      addressObj.name,
      addressObj.surname,
      addressObj.email,
      addressObj.phone,
      addressObj.zip,
      addressObj.city,
      addressObj.street,
      addressObj.address,
      addressObj.additionalInfo,
      userId,
    ]);

    if (result.affectedRows === 1) {
      return true;
    } else {
      throw new Error("Error adding new address");
    }
  } catch (error) {
    throw error;
  }
};

const getUserAddresses = async (userId) => {
  try {
    const addresses = await query(getUserAddressesQuery, [userId]);
    return addresses;
  } catch (error) {
    throw error;
  }
};

const deleteUserAddressSQL = async (userId, addressId) => {
  try {
    const result = await query(deleteUserAddressQuery, [addressId, userId]);

    if (result.affectedRows === 1) {
      return true;
    } else {
      throw new Error("Error deleting address");
    }
  } catch (error) {
    throw error;
  }
};

const verifyReviewRightSQL = async (userId, productId) => {
  try {
    const result = await query(verifyReviewRightQuery, [
      userId,
      productId,
      userId,
      productId,
    ]);

    if (result.length > 0 && result[0].can_post_review === 1) {
      return true;
    } else {
      throw new Error("User can't post review");
    }
  } catch (error) {
    throw error;
  }
};

const createReviewSQL = async (userId, productId, userName, reviewData) => {
  try {
    const hasReviewRight = await verifyReviewRightSQL(userId, productId);
    if (hasReviewRight) {
      const { liked, not_liked, comment, rating } = reviewData;
      const createReviewQuery = `
        INSERT INTO reviews (user_id, item_id, created_at, verified, rating, liked, not_liked, comment, name)
        VALUES (?, ?, NOW(), 1, ?, ?, ?, ?, ?);
      `;
      const result = await query(createReviewQuery, [
        userId,
        productId,
        rating || null,
        liked || null,
        not_liked || null,
        comment || null,
        userName || null,
      ]);
      if (result.affectedRows === 1) {
        return true;
      } else {
        throw new Error("Error inserting review");
      }
    } else {
      throw new Error("User does not have the right to post a review.");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReviewSQL,
  verifyReviewRightSQL,
  getUser,
  resetMsg,
  resetPassword,
  getUserData,
  getUserWishListSQL,
  deleteItemFromWishlist,
  addItemToWishList,
  userExists,
  addNewUser,
  getOrderForEmail,
  getUserOrderHistorySQL,
  addNewAddressSQL,
  getUserAddresses,
  deleteUserAddressSQL,
};
