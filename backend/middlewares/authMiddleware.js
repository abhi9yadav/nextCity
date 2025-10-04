const admin = require("../config/firebase");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  try {
    console.log("verify token 1 has reached\n");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);

    // Attach decoded Firebase info
    req.user = decoded;
    console.log("verify token 2 has reached\n");
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};


// Middleware for role-based access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "User not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient role" });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
