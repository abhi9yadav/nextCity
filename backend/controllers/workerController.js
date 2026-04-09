const Complaint = require('../models/complaintModel');
const mongoose = require('mongoose');

// Redis import hata diya gaya hai

// --------------------------------------------------------
// 1. GET ASSIGNED COMPLAINTS
// --------------------------------------------------------
exports.getMyAssignedComplaints = async (req, res) => {
  try {
    const workerId = req.user._id;

    // Direct DB se fetch kar rahe hain
    console.log(`🐌 Serving Worker ${workerId} Complaints from DB`);
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

// --------------------------------------------------------
// 2. UPDATE COMPLAINT STATUS
// --------------------------------------------------------
exports.updateComplaintStatus = async (req, res) => {
  const complaintId = req.params.id;
  const { status, remarks } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role; 

  if (!status) {
    return res.status(400).json({ message: "New status is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    return res.status(400).json({ message: "Invalid complaint ID." });
  }

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const oldStatus = complaint.status;

    // Role Based Access (Worker)
    if (userRole === "WORKER") {
      const allowedStatusUpdates = ["IN_PROGRESS", "RESOLVED"];
      if (!allowedStatusUpdates.includes(status)) {
        return res.status(400).json({ message: "Invalid status update for worker." });
      }
      if (!complaint.assignedTo || complaint.assignedTo.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden: Not assigned to this complaint." });
      }
      if (status === "RESOLVED" && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ message: "Proof photo/video is required to resolve complaint." });
      }
    }
    // Role Based Access (Citizen)
    else if (userRole === "CITIZEN") {
      const allowedStatusUpdates = ["REOPENED"];
      if (!allowedStatusUpdates.includes(status)) {
        return res.status(400).json({ message: "Invalid status update for citizen." });
      }
      if (complaint.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden: You did not create this complaint." });
      }
      if (complaint.status !== "RESOLVED") {
        return res.status(400).json({ message: "You can reopen only resolved complaints." });
      }
      complaint.assignedTo = null;
    } else {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    // Update Status & History
    complaint.status = status;
    const historyEntry = {
      by: userId,
      action: "status_changed",
      from: oldStatus,
      to: status,
      note: remarks || `Status changed to ${status} by ${userRole}`,
      timeStamp: new Date(),
    };

    if (status === "RESOLVED" && req.files) {
      historyEntry.action = "resolved_proof";
      historyEntry.attachments = req.files.map((file) => ({
        url: file.path, 
        type: file.mimetype.startsWith("video") ? "video" : "image",
      }));
    }

    complaint.history.push(historyEntry);

    if (status === "RESOLVED") complaint.resolved_at = new Date();
    if (status === "REOPENED") complaint.resolved_at = null;

    await complaint.save();

    // Redis Invalidation logic yahan se hata diya gaya hai

    res.status(200).json({
      message: `Complaint status updated to ${status} successfully.`,
      complaint,
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ message: "Server error while updating complaint status." });
  }
};

// --------------------------------------------------------
// 3. GET WORKER STATS
// --------------------------------------------------------
exports.getWorkerStats = async (req, res) => {
  try {
    const workerId = req.user._id;

    // Direct DB Calculations
    console.log(`Calculating Worker ${workerId} Stats from DB`);
    const totalAssigned = await Complaint.countDocuments({ assigned_worker_id: workerId });
    const resolved = await Complaint.countDocuments({ assigned_worker_id: workerId, status: 'RESOLVED' });
    const inProgress = await Complaint.countDocuments({ assigned_worker_id: workerId, status: 'IN_PROGRESS' });
    const pendingAssignment = await Complaint.countDocuments({ assigned_worker_id: workerId, status: 'OPEN' });

    const statsData = { totalAssigned, resolved, inProgress, pendingAssignment };

    res.status(200).json(statsData);
  } catch (error) {
    console.error('Error fetching worker stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// --------------------------------------------------------
// 4. RESOLVE COMPLAINT
// --------------------------------------------------------
exports.resolveComplaint = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { note, attachments } = req.body;
    const workerId = req.user.id; 

    if (!note || !attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a resolution note and at least one attachment as proof.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    
    if (complaint.status === 'RESOLVED') {
        return res.status(400).json({ success: false, message: 'This complaint has already been resolved.' });
    }
    
    const previousStatus = complaint.status;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        $set: { status: 'RESOLVED' },
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
      { new: true, runValidators: true }
    ).populate('history.by', 'name');

    // Redis Invalidation logic yahan se hata diya gaya hai

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