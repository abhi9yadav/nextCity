// Auth Middleware for validating Firebase tokens and checking user roles

const admin = require('firebase-admin');
const User = require('../models/userModel'); // Base User model
const CityAdmin = require('../models/cityAdminModel'); // CityAdmin discriminator
// ... require other discriminator models as needed

// Initialize Firebase Admin (assuming service account is set up elsewhere)
// For simplicity, we'll assume the initialization happens here if not globally.
// const serviceAccount = require('../../path/to/your/serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/**
 * 1. Verifies the Firebase ID token and authenticates the user.
 * 2. Fetches the Mongoose User document and attaches it to req.user.
 */
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
        const user = await User.findOne({ firebaseUid }).exec();

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

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * @param {Array<string>} requiredRoles - An array of roles (e.g., ['super_admin', 'city_admin'])
 */
const roleCheck = (requiredRoles) => {
    return (req, res, next) => {
        // Ensure authenticate middleware ran first and attached req.user
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
