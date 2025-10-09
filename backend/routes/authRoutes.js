const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// console.log("going for verify token 1 has reached\n");
router.post("/signup", verifyToken, signup);

router.post("/login", authenticate, login);

router.get("/me", authenticate, userController.getMe);

module.exports = router;
