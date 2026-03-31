const Complaint = require('../models/complaintModel');
const mongoose = require('mongoose');

exports.getMyAssignedComplaints = async (req, res) => {
  try {
    const workerId = req.user._id;

    const complaints = await Complaint.find({ assignedTo: workerId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching worker complaints:', error);
    res.status(500).json({ message: 'Failed to fetch assigned complaints.' });
  }
};



exports.updateComplaintStatus = async (req, res) => {
  const complaintId = req.params.id;
  const { status, remarks } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role; // 'CITIZEN' or 'WORKER'

  if (!status) {
    return res.status(400).json({ message: "New status is required." });
  }

  // Validate complaint ID
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    return res.status(400).json({ message: "Invalid complaint ID." });
  }

  try {
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const oldStatus = complaint.status;

    // -------------------------
    // ROLE BASED ACCESS
    // -------------------------

    if (userRole === "WORKER") {
      const allowedStatusUpdates = ["IN_PROGRESS", "RESOLVED"];

      if (!allowedStatusUpdates.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status update for worker." });
      }

      if (
        !complaint.assignedTo ||
        complaint.assignedTo.toString() !== userId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Forbidden: Not assigned to this complaint." });
      }

      // Worker must upload proof when resolving complaint
      if (status === "RESOLVED" && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
          message: "Proof photo/video is required to resolve complaint.",
        });
      }
    }

    else if (userRole === "CITIZEN") {
      const allowedStatusUpdates = ["REOPENED"];

      if (!allowedStatusUpdates.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status update for citizen." });
      }

      if (complaint.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You did not create this complaint.",
        });
      }

      if (complaint.status !== "RESOLVED") {
        return res.status(400).json({
          message: "You can reopen only resolved complaints.",
        });
      }

      complaint.assignedTo = null;
    }

    else {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    // -------------------------
    // UPDATE STATUS
    // -------------------------

    complaint.status = status;

    const historyEntry = {
      by: userId,
      action: "status_changed",
      from: oldStatus,
      to: status,
      note: remarks || `Status changed to ${status} by ${userRole}`,
      timeStamp: new Date(),
    };

    // -------------------------
    // ADD PROOF ATTACHMENTS
    // -------------------------

    if (status === "RESOLVED" && req.files) {
      historyEntry.action = "resolved_proof";

      historyEntry.attachments = req.files.map((file) => ({
        url: file.path, // cloudinary or storage url
        type: file.mimetype.startsWith("video") ? "video" : "image",
      }));
    }

    complaint.history.push(historyEntry);

    // -------------------------
    // RESOLUTION TIMESTAMP
    // -------------------------

    if (status === "RESOLVED") {
      complaint.resolved_at = new Date();
    }

    if (status === "REOPENED") {
      complaint.resolved_at = null;
    }

    await complaint.save();

    res.status(200).json({
      message: `Complaint status updated to ${status} successfully.`,
      complaint,
    });

  } catch (error) {
    console.error("Error updating complaint status:", error);

    res.status(500).json({
      message: "Server error while updating complaint status.",
    });
  }
};


exports.getWorkerStats = async (req, res) => {
  try {
    const workerId = req.user._id;

    const totalAssigned = await Complaint.countDocuments({
      assigned_worker_id: workerId,
    });
    const resolved = await Complaint.countDocuments({
      assigned_worker_id: workerId,
      status: 'RESOLVED',
    });
    const inProgress = await Complaint.countDocuments({
      assigned_worker_id: workerId,
      status: 'IN_PROGRESS',
    });
    const pendingAssignment = await Complaint.countDocuments({
      assigned_worker_id: workerId,
      status: 'OPEN',
    });

    res.status(200).json({
      totalAssigned,
      resolved,
      inProgress,
      pendingAssignment,
    });
  } catch (error) {
    console.error('Error fetching worker stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    // Step 1: Get the complaint ID from the URL parameters
    const { id: complaintId } = req.params;

    // Step 2: Get the proof details from the request body
    // The 'attachments' should be an array of objects like [{ url: '...', type: 'image' }]
    const { note, attachments } = req.body;

    // Step 3: Get the worker's ID from the authenticated user.
    // This assumes you have an authentication middleware that adds the user object to the request.
    const workerId = req.user.id; 

    // --- Input Validation ---
    if (!note || !attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a resolution note and at least one attachment as proof.' 
      });
    }

    // --- Find the Complaint ---
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // --- Check if the complaint can be resolved ---
    // You might want to add logic here to ensure only the assigned worker can resolve it.
    // For example: if (complaint.assignedTo.toString() !== workerId) { ... }
    
    if (complaint.status === 'RESOLVED') {
        return res.status(400).json({ success: false, message: 'This complaint has already been resolved.' });
    }
    
    const previousStatus = complaint.status;

    // --- Update the Complaint ---
    // This is an atomic operation that finds, updates, and returns the new document.
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        // 1. Set the new status
        $set: { status: 'RESOLVED' },
        // 2. Push the resolution proof into the history array
        $push: {
          history: {
            by: workerId,
            action: 'resolved_proof',
            from: previousStatus,
            to: 'RESOLVED',
            note: note,
            attachments: attachments,
          },
        },
      },
      { 
        new: true, // Return the modified document rather than the original
        runValidators: true // Ensure the update follows schema rules
      }
    ).populate('history.by', 'name'); // Optionally populate user name in history

    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully with proof.',
      data: updatedComplaint,
    });

  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while resolving complaint.' });
  }
};

