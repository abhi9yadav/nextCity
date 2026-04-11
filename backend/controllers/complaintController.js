const Complaint = require("../models/complaintModel");
const User = require("../models/userModel");
const Zone = require("../models/zoneModel");
const Department = require("../models/departmentModel");
const cloudinary = require("../config/cloudinary");

cloudinary.config();

const bufferToDataUri = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

// 1. CREATE COMPLAINT

exports.createComplaint = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== 'citizen') {
      return res.status(403).json({ error: "Only Citizens can create complaints." });
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
      finalComplaintData.city_id = zone.city_id;
    }

    const complaint = new Complaint(finalComplaintData);
    await complaint.save();

    res.status(201).json(complaint);
  } catch (error) {
    console.error("File upload/Complaint creation failed:", error);
    res.status(400).json({ error: "Failed to create complaint: " + error.message });
  }
};

// 2. GET ALL COMPLAINTS

exports.getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. UPVOTE COMPLAINT

exports.toggleVote = async (req, res) => {
  try {
    const userId = req.user._id;
    const complaintId = req.params.id;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const alreadyVoted = complaint.votes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyVoted) {
      complaint.votes = complaint.votes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      complaint.votes.push(userId);
    }

    await complaint.save();

    res.json({
      votes: complaint.votes,
      hasUpvoted: !alreadyVoted, // new state
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 4. UPDATE COMPLAINT

exports.updateComplaint = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "complaints" },
        (error, result) => {
          if (error) throw error;
          imageUrl = result.secure_url;
        }
      );

      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(result);
    }

    const updateData = { ...req.body };
    if (imageUrl) updateData.photo = imageUrl;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    Object.assign(complaint, updateData);

    if (req.body.status === 'RESOLVED') {
      complaint.history.push({
        by: req.user._id,
        action: 'status_changed',
        from: complaint.status,
        to: 'RESOLVED',
        note: req.body.remarks || '',
        attachments: imageUrl ? [{ url: imageUrl, type: 'image' }] : [],
      });
    }

    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 5. DELETE COMPLAINT

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. GET MY COMPLAINTS

exports.getMyComplaints = async (req, res) => {
  const { id } = req.params;
 
  try {
    const myComplaints = await Complaint.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

    res.status(200).json(myComplaints);
  } catch (error) {
    console.error("Error fetching user's complaints:", error);
    res.status(500).json({ error: "Failed to fetch user complaints" });
  }
};