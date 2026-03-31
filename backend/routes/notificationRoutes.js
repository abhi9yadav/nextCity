const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");

// All routes require login
router.use(authenticate);

router.get("/", notificationController.getMyNotifications);

router.patch("/:id/read", notificationController.markAsRead);

router.patch("/read-all", notificationController.markAllAsRead);

module.exports = router;