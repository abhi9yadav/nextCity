const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const multer = require("multer");
const authenticateUser = require("../middlewares/authMiddleware");

console.log("authenticateUser:", authenticateUser);

// Configure Multer to store files in memory.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all complaints
router.get("/", complaintController.getAllComplaints);

// Create a new complaint
router.post(
  "/",
  authenticateUser.verifyToken,
  upload.array("attachments", 5),
  complaintController.createComplaint
);

// Upvote a complaint
router.post(
  "/:id/vote",
  authenticateUser.verifyToken,
  complaintController.upvoteComplaint
);

// Update complaint
router.patch("/:id", complaintController.updateComplaint);

// Delete complaint
router.delete("/:id", complaintController.deleteComplaint);

module.exports = router;
