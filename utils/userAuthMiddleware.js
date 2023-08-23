const jwt = require("jsonwebtoken");
const secretKey = require("../config").secretKey;

const verifyTokenAndSession = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    if (req.session && JSON.parse(req.cookies.openData) === decoded.sub) {
      req.decodedToken = decoded.sub;
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized: Invalid session" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyTokenAndSession;
