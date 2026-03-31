const Notification = require('../models/notificationModel');

exports.getMyNotifications = async (req, res, next) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: notifications,
  });
};

//2. Mark single notification as read
exports.markAsRead = async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: notification,
  });
};

//mark all notification as read
exports.markAllAsRead = async (req, res, next) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
};