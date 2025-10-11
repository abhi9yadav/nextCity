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
  const workerId = req.user._id;

  if (!status) {
    return res.status(400).json({ message: 'New status is required.' });
  }
  const allowedStatusUpdates = ['IN_PROGRESS', 'RESOLVED'];
  if (!allowedStatusUpdates.includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    return res.status(400).json({ message: 'Invalid complaint ID.' });
  }

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found.' });
    //console.log('complaint found:', complaint);

    // Authorization Check
    if (!complaint.assignedTo)
      return res
        .status(403)
        .json({ message: 'Complaint not assigned to any worker.' });

    if (complaint.assignedTo.toString() !== workerId.toString())
      return res
        .status(403)
        .json({
          message: 'Forbidden: You are not assigned to this complaint.',
        });

    // Update status
    complaint.status = status;

    complaint.history.push({
      by: workerId,
      action: 'status_changed',
      note: remarks || 'Status updated by worker.',
      timeStamp: new Date(),
    });

    if (status === 'RESOLVED') complaint.resolved_at = new Date();

    // Sanitize invalid votes
    complaint.votes = (complaint.votes || []).filter((v) =>
      mongoose.Types.ObjectId.isValid(v)
    );

    await complaint.save();

    res.status(200).json({
      message: 'Complaint status updated successfully.',
      complaint: complaint.toObject(),
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
};

exports.getWorkerStats = async (req, res) => {
  try {
    const workerId = req.user._id;
    //console.log('Worker ID we are finding worker complaints for:', workerId);

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
