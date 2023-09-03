const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const verifyTokenCart = (req, res, next) => {
  const token = req.cookies.accessToken;
  req.decodedToken = null;

  if (!token) {
    next();
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    if (req.session && JSON.parse(req.cookies.openData) === decoded.sub) {
      req.decodedToken = decoded.sub;
      next();
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

module.exports = verifyTokenCart;
