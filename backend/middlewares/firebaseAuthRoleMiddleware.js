const admin = require('firebase-admin');
const User = require('../models/userModel');
const CityAdmin = require('../models/cityAdminModel');

const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token not provided.' });
    }

    const idToken = header.split(' ')[1];

    try {
        // Step 1: Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;

        // Step 2: Find the corresponding Mongoose User document (using the base model)
        const user = await User.findOne({ firebaseUid }).withSensitiveFields().exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found in database.' });
        }

        // Step 3: Attach the user document to the request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication Error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

const roleCheck = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(500).json({ message: 'Role check failed: User context missing.' });
        }

        if (requiredRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${req.user.role}` 
            });
        }
    };
};

module.exports = { authenticate, roleCheck };
