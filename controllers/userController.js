const userModel = require("../models/userModel");
const sendEmail = require("../utils/auth/emailAuth");
const { clearRefreshToken } = require("../utils/auth/tokenUtils");

const authUser = async (req, res) => {
  try {
    if (!req.decodedToken) {
      res.status(403).json({ error: "Wrong credentials: access denied" });
    }
    res.json(req.decodedToken);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("Required data is missing");
    }
    const userCreated = await userModel.addNewUser(email, password, name);
    if (!userCreated) {
      throw new Error("User creation failed");
    }
    await userModel.getUser(email, password, res);
  } catch (error) {
    return res.status(500).json({ error: "An error occurred" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Required data is missing");
    }
    req.session.user = { email };
    await userModel.getUser(email, password, res);
  } catch (error) {
    if (error.name === "UserNotFoundError") {
      res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
};

const logOutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await clearRefreshToken(refreshToken);
    }
    res.clearCookie("accessToken");
    res.clearCookie("openData");
    res.clearCookie("refreshToken");
    res.clearCookie("connect.sid");
    res.clearCookie("wishlist");
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { resetToken, newUserPassowrd } = req.body;
    if (!resetToken || !newUserPassowrd) {
      throw new Error("Required data is missing");
    }
    const { email, newPassword } = await userModel.resetPassword(
      req.body.resetToken,
      req.body.newUserPassowrd
    );
    if (!email || !newPassword) {
      throw new Error("Password resetting has failed");
    }
    await userModel.getUser(email, newPassword, res);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const resetUserPasswordMsg = async (req, res) => {
  try {
    const userEmail = req.body.userEmail;
    if (!userEmail) {
      throw new Error("Required data is missing");
    }
    const resetToken = await userModel.resetMsg(userEmail);
    if (!resetToken) {
      throw new Error("Reset token creation has failed");
    }
    const link = `http://localhost:3000/user/passReset?resetToken=${resetToken}`;
    const emailStatus = await sendEmail(link, req.body.userEmail);
    if (!emailStatus) {
      throw new Error("Email hasn't been sent");
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const email = req.decodedToken;
    if (!email) {
      throw new Error("Required data is missing");
    }
    const userProfileData = await userModel.getUserData(email);
    if (!userProfileData) {
      throw new Error("User data hasn't been retrieved");
    }
    res.json(userProfileData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const authOrderAccess = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const email = req.decodedToken;
    if (!orderId) {
      throw new Error("Required data is missing");
    }
    if (!email) {
      throw new Error("Wrong credentials for user");
    }
    const orderStatus = await userModel.getOrderForEmail(email, orderId);

    if (!orderStatus) {
      throw new Error("Order status hasn't been retrieved");
    }
    res.json({ userOk: true, orderOk: orderStatus });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const updateUserProfile = async (req, res) => {
  // Handle user profile update logic using userModel functions
};

const manageUserWishlist = async (req, res) => {
  try {
    const { itemInWishList, productId, userId } = req.body;
    if (itemInWishList === undefined || !productId || !userId) {
      throw new Error("Missing required data");
    }

    if (itemInWishList) {
      await userModel.deleteItemFromWishlist(userId, productId);
    } else {
      await userModel.addItemToWishList(userId, productId);
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getUsersWishList = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      throw new Error("Missing required data");
    }
    const wishListArray = await userModel.getUserWishListSQL(userId);
    if (!wishListArray) {
      throw new Error("Wish list hasn't been retrieved");
    }
    res.json(wishListArray);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getUsersOrderHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      throw new Error("Missing required data");
    }
    const orderHistory = await userModel.getUserOrderHistorySQL(userId);
    if (!orderHistory) {
      throw new Error("Wish list hasn't been retrieved");
    }
    res.json(orderHistory);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  getUserProfile,
  updateUserProfile,
  resetUserPassword,
  authUser,
  manageUserWishlist,
  getUsersWishList,
  resetUserPasswordMsg,
  getUsersOrderHistory,
};
