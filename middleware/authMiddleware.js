const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Support "Bearer <token>"
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { userId: <id> }

    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
