const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { authenticate, roleCheck } = require("../middlewares/firebaseAuthRoleMiddleware");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const passwordController = require("../controllers/passwordController");
const tokenController = require("../controllers/tokenController");
const userController = require("../controllers/userController");
const upload = require("../middlewares/uploadMiddleware");

router.post("/signup", verifyToken, signup);
router.post("/login", authenticate, login);
router.get('/validate-token', tokenController.validateToken);
router.post('/set-password', passwordController.setPasswordWithToken);
router.get("/me", authenticate, userController.getMe);
router.put('/update', authenticate, upload.single("photo"), userController.updateProfile);
module.exports = router;