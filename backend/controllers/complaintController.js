const Complaint = require("../models/complaintModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
const Zone = require("../models/zoneModel");
const Department = require("../models/departmentModel");

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

    const department_id = await Department.findOne({department_name: req.body.concernedDepartment}).select('_id');
    if(!department_id) {
      return res.status(400).json({ error: "Invalid concernedDepartment" });
    }
    finalComplaintData.department_id = department_id._id;

    const zone = await Zone.findOne({
      department_id, 
      geographical_boundary: {
        $geoIntersects: { $geometry: finalComplaintData.location },
      },
    });
    
    if (zone) { 
      finalComplaintData.zone_id = zone._id;
      const city_id = zone ? zone.city_id : null;
      finalComplaintData.city_id = city_id;
    }

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
    complaint.votes.push(req.user.id);
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

//mycomplaints
exports.getMyComplaints = async (req, res) => {
  console.log("request ", req);
  const { id } = req.params;
  console.log("id is here ", id);

 
  try {
    
    
    const myComplaints = await Complaint.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");
    console.log("my complaints are here ", myComplaints);
    res.status(200).json(myComplaints);
  } catch (error) {
    console.error("Error fetching user's complaints:", error);
    res.status(500).json({ error: "Failed to fetch user complaints" });
  }
};


