// authMiddleware.js
const admin = require("../config/firebase");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;
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

const roleCheck = (allowedRoles) => {
    return async (req, res, next) => {
        const firebaseUid = req.user.uid; // Get UID from the `authenticate` middleware

        try {
            // Find the user in your MongoDB to get their role
            const userProfile = await User.findOne({ firebaseUid: firebaseUid });

            if (!userProfile) {
                return res.status(404).json({ message: 'User not found in the database.' });
            }

            // Check if the user's role is in the list of allowed roles
            if (allowedRoles.includes(userProfile.role)) {
                // User has the required role, proceed to the controller
                next();
            } else {
                // User does not have the required role
                return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
            }
        } catch (error) {
            console.error('Error during role check:', error);
            return res.status(500).json({ message: 'Server error during authorization.' });
        }
    };
};

module.exports = { verifyToken, requireRole, roleCheck };
