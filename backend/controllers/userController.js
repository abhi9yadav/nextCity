const User = require('../models/userModel');

exports.getMe = async (req, res) => {
    try {
        const firebaseUid = req.user.firebaseUid;

        if (!firebaseUid) {
            return res.status(401).json({ message: 'Authentication error: UID not found.' });
        }

        const userProfile = await User.findOne({ firebaseUid: firebaseUid }).select('-password');

        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found in database.' });
        }

        res.status(200).json(userProfile);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching user profile.' });
    }
};