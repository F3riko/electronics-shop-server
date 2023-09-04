const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const verifyTokenCart = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    if (req.session && JSON.parse(req.cookies.openData) === decoded.sub) {
      req.decodedToken = decoded.sub;
      return next();
    } else {
      return next();
    }
  } catch (error) {
    return next();
  }
};

module.exports = verifyTokenCart;
