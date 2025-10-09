const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const passwordController = require("../controllers/passwordController");
const tokenController = require("../controllers/tokenController");

// Signup: Create MongoDB user after Firebase signup
// console.log("going for verify token 1 has reached\n");
router.post("/signup", verifyToken, signup);

// Login: Just verify token + return user
router.post("/login", verifyToken, login);
router.get('/validate-token', tokenController.validateToken);
router.post('/set-password', passwordController.setPasswordWithToken);

module.exports = router;
