const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const multer = require("multer");
const authenticateUser = require("../middlewares/authMiddleware");
const {authenticate }=require('../middlewares/firebaseAuthRoleMiddleware')
const upload = require("../middlewares/uploadMiddleware");

// Configure Multer to store files in memory.
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// Upvote a complaint
router.post(
  "/:id/vote",
  authenticate,
  complaintController.toggleVote
);
// Get all complaints
router.get("/allcomplaints",authenticate, complaintController.getAllComplaints);

// Getmy all complaints
router.get("/:id/my", authenticate, complaintController.getMyComplaints);

// Create a new complaint
router.post(
  "/",
  authenticate,
  upload.array("attachments", 5),
  complaintController.createComplaint
);

// Update complaint
console.log("we are here to go patch result🤣🤣🤣");

router.patch(
  "/:id",authenticate,
  upload.single("photo"),
  complaintController.updateComplaint
);

//router.patch("/:id", complaintController.updateComplaint);

// Delete complaint
router.delete("/:id", authenticate, complaintController.deleteComplaint);

module.exports = router;
