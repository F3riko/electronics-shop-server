const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const sessionModel = require("../models/sessionModel");

// Controller functions related to session operations
function createSession(req, res) {
  // Handle session creation logic using sessionModel functions
}

function deleteSession(req, res) {
  // Handle session deletion
}

function checkAuthentication(req, res) {
  // Check if the user is authenticated, middleware logic using sessionModel functions
}

// Divide it further -> login to the sessionModel file
const verifyTokenAndSession = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.decodedToken = decoded.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

const verifyTokenCart = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.decodedToken = decoded.sub;
    return next();
  } catch (error) {
    return next();
  }
};

module.exports = {
  createSession,
  deleteSession,
  checkAuthentication,
  verifyTokenAndSession,
  verifyTokenCart,
};
