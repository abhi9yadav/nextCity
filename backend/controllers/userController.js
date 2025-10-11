const User = require('../models/userModel');
const cloudinary = require("cloudinary").v2;

cloudinary.config();
// Helper to convert buffer to Data URI
const bufferToDataUri = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

exports.getMe = async (req, res) => {
  try {
    const firebaseUid = req.user?.firebaseUid;
    if (!firebaseUid) return res.status(401).json({ message: 'Authentication error: UID not found.' });

    const userProfile = await User.findOne({ firebaseUid }).select('-password');
    if (!userProfile) return res.status(404).json({ message: 'User profile not found in database.' });

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const firebaseUid = req.user?.firebaseUid;
    if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized access.' });

    const updates = req.body;
    const allowedFields = ['name', 'email', 'phone'];
    const sanitizedUpdates = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) sanitizedUpdates[field] = updates[field];
    });

    // Handle photo upload
    console.log("req.file:going to upload photo😎😎😎😎😎", req.file);
    if (req.file) {
      const fileDataUri = bufferToDataUri(req.file);
      const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
        folder: 'user_photos',
        resource_type: 'image',
        overwrite: true,
      });
      sanitizedUpdates.photoURL = uploadResult.secure_url;
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: sanitizedUpdates },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};
