const Complaint = require("../models/complaintModel");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

// const getStream = require("get-stream");
cloudinary.config();

// Utility function to convert buffer to data URI for Cloudinary
const bufferToDataUri = (file) => {
  // Note: file.mimetype is available because Multer is configured to use memoryStorage()
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

exports.createComplaint = async (req, res) => {
  try {
    // Fetch the MongoDB user using Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const uploadedFiles = req.files || [];
    const attachmentUrls = [];

    // Upload files to Cloudinary
    for (const file of uploadedFiles) {
      const dataUri = bufferToDataUri(file);
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "complaints",
        resource_type: "auto",
      });
      attachmentUrls.push({
        url: result.secure_url,
        type: result.resource_type === "video" ? "video" : "image",
      });
    }

    // Parse location
    const loc = req.body.location
      ? req.body.location
      : {
          lat: req.body["location[lat]"],
          lng: req.body["location[lng]"],
          address: req.body["location[address]"],
        };

    const parseCoordinate = (value) => {
      if (value === null || value === undefined || value === "")
        return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Build final complaint
    const finalComplaintData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      createdBy: user._id, // ✅ dynamically assign logged-in user
      location: {
        lat: parseCoordinate(loc.lat),
        lng: parseCoordinate(loc.lng),
        address: loc.address || "",
      },
      attachments: attachmentUrls,
    };

    const complaint = new Complaint(finalComplaintData);
    await complaint.save();

    res.status(201).json(complaint);
  } catch (error) {
    console.error("File upload/Complaint creation failed:", error);
    res
      .status(400)
      .json({ error: "Failed to create complaint: " + error.message });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upvote complaint
exports.upvoteComplaint = async (req, res) => {
  try {
    // console.log(req.params.id);
    const complaint = await Complaint.findById(req.params.id);
    // console.log("complaint"+complaint);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // console.log(req.user);
    if (complaint.votes.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You already voted this complaint" });
    }

    await complaint.save();
    res.json({ message: "Vote added", votes: complaint.votes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint
exports.updateComplaint = async (req, res) => {
  try {
    // console.log(req.params.id);
    // console.log(req.body);
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
