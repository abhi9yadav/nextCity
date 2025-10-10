const Complaint = require("../models/complaintModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config();

const bufferToDataUri = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

exports.createComplaint = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== 'citizen') {
      return res
        .status(403)
        .json({ error: "Only Citizens can create complaints." });
    }

    const uploadedFiles = req.files || [];
    const attachmentUrls = [];

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

    let loc = req.body.location;
    if (typeof loc === "string") loc = JSON.parse(loc);

    const lng = parseFloat(loc.coordinates[0]);
    const lat = parseFloat(loc.coordinates[1]);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const finalComplaintData = {
      title: req.body.title,
      description: req.body.description,
      concernedDepartment: req.body.concernedDepartment,
      createdBy: user._id,
      location: {
        type: "Point",
        coordinates: [lng, lat],
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

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
