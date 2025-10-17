const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, complaint: 1, action: 1, createdAt: -1 });
module.exports = mongoose.model('Activity', activitySchema);
