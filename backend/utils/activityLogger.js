const Activity = require('../models/activityModel');

exports.logActivity = async ({ req, userId, role, action, complaintId, targetUserId, details, meta = {}, session = null }) => {
  const payload = {
    user: userId,
    role,
    action,
    complaint: complaintId,
    targetUser: targetUserId,
    details,
    meta,
    ip: req?.ip,
    userAgent: req?.get?.('User-Agent') || ''
  };
  if (session) {
    return Activity.create([payload], { session });
  } else {
    return Activity.create(payload);
  }
};
