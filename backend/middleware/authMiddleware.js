const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.headers.authorization;

  if (!token) return res.status(403).json("No token");

  // Handle Bearer prefix if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};