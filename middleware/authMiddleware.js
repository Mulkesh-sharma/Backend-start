// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Extract token
    let token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration. JWT secret missing."
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = {
      userId: decoded.userId
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
