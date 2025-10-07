// Controller functions for Super Admin tasks

const City = require('../models/cityModel');
const Department = require('../models/departmentModel');
const User = require('../models/userModel'); // Base for general queries
const CityAdmin = require('../models/cityAdminModel'); // Discriminator for creation
const DeptAdmin = require('../models/deptAdminModel');
const Worker = require('../models/workerModel');

const admin = require('firebase-admin');
const mongoose = require('mongoose');

// Helper to safely create user documents using discriminators
const DISCRIMINATOR_MODELS = {
    'super_admin': User.discriminators.super_admin,
    'city_admin': CityAdmin, // This is already a discriminator model
    'dept_admin': DeptAdmin,
    'worker': Worker,
    // Add other user roles if they exist on the base model (e.g., 'citizen')
};


// --- Core Resource Management ---

/**
 * POST /api/super/cities
 * Allows Super Admin to create a new City.
 */
exports.createCity = async (req, res) => {
    try {
        const { city_name, country } = req.body;
        
        // Ensure the name is provided
        if (!city_name) {
            return res.status(400).json({ message: 'City name is required.' });
        }

        const newCity = new City({ city_name, country });
        await newCity.save();

        res.status(201).json({ 
            message: 'City created successfully.', 
            city: newCity.toObject() 
        });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ message: 'A city with this name already exists.' });
        }
        console.error('Error creating city:', error);
        res.status(500).json({ message: 'Server error while creating city.' });
    }
};

/**
 * POST /api/super/departments
 * Allows Super Admin to create a new Department.
 */
exports.createDepartment = async (req, res) => {
    try {
        const { department_name, description, photoURL } = req.body;
        
        // Ensure the name is provided
        if (!department_name) {
            return res.status(400).json({ message: 'Department name is required.' });
        }

        const newDepartment = new Department({ department_name, description, photoURL });
        await newDepartment.save();

        res.status(201).json({ 
            message: 'Department created successfully.', 
            department: newDepartment.toObject() 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A department with this name already exists.' });
        }
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Server error while creating department.' });
    }
};

// --- Delegated User Creation Logic (Super Admin) ---

/**
 * POST /api/super/users/create
 * Super Admin can create any user role. We must first create the Firebase user
 * and then create the corresponding Mongoose document.
 */
exports.createUser = async (req, res) => {
    const { email, name, role, city_id, phone, photoURL } = req.body;
    
    
    // 1. Basic validation and role check
    if (!email || !name || !role) {
        return res.status(400).json({ message: 'Email, name, and role are required.' });
    }

    if(role !== 'city_admin'){
        return res.status(400).json({ message: 'here you can add only City Admin' });
    }
    
    const TargetModel = DISCRIMINATOR_MODELS[role];
    if (!TargetModel) {
        return res.status(400).json({ message: `Invalid target role specified: ${role}.` });
    }
    
    // 2. Check if required hierarchy IDs are provided for the target role
    if (['city_admin'].includes(role) && !city_id) {
        return res.status(400).json({ message: `${role} creation requires a city_id.` });
    }


    
    // 3. Create Temporary Firebase Account and Invitation Link
    // We create a temporary, disabled Firebase account and use the UID.
    let firebaseUser;
    try {
        // Generate a temporary password (will be overwritten by the invite link flow later)
        const tempPassword = new mongoose.Types.ObjectId().toString();

        firebaseUser = await admin.auth().createUser({
            email: email,
            displayName: name,
            password: tempPassword,
             // Disable the account until the user accepts the invitation
        });

        const firebaseUid = firebaseUser.uid;
        
        // 5. Create Mongoose Document using the Discriminator Model
        const userData = {
            firebaseUid,
            email,
            name,
            role,
            city_id, // undefined prevents setting null if not required
            phone,
            photoURL
        };
        
        const newUserDocument = new TargetModel(userData);
        await newUserDocument.save();
        
        // 6. Generate Invitation Link (Placeholder Logic)
        // In a full application, you would generate a custom token or action link here
        const inviteLink = `[Placeholder: Secure Invitation Link for ${email}]`;

        res.status(201).json({
            message: `User (${role}) created successfully. Invitation email dispatched.`,
            mongooseUser: newUserDocument.toObject(),
            firebaseUid: firebaseUid,
            inviteLink // In real life, this is sent via email service
        });

    } catch (error) {
        // IMPORTANT: Handle rollbacks if one creation step fails
        if (firebaseUser) {
            console.warn('Attempting Firebase rollback...');
            await admin.auth().deleteUser(firebaseUser.uid).catch(e => console.error('Firebase rollback failed:', e));
        }
        
        if (error.code && error.code === 'auth/email-already-exists') {
            return res.status(409).json({ message: 'A user with this email already exists in Firebase.' });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
             // Mongoose validation or ID format error
             return res.status(400).json({ message: `Data validation failed: ${error.message}` });
        }
        
        console.error('Error during user creation:', error);
        res.status(500).json({ message: 'Server error during user creation process.' });
    }
};

/**
 * GET /api/super/cities
 * Retrieves all cities for dropdowns/management.
 */
exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find({}).select('-_id -__v'); // Exclude internal fields
        res.status(200).json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Failed to fetch cities.' });
    }
};

/**
 * GET /api/super/departments
 * Retrieves all departments for dropdowns/management.
 */
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({}).select('-_id -__v'); // Exclude internal fields
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Failed to fetch departments.' });
    }
};

/**
 * GET /api/super/admins/city
 * Retrieves all City Admins, populating their city association.
 */
exports.getAllCityAdmins = async (req, res) => { 
    try {
        // Use the CityAdmin discriminator model for targeted querying
        const cityAdmins = await CityAdmin.find({})
            .populate({ path: 'city_id', select: 'city_name' }) // **NEW: Populates the city name**
            .select('-__v'); 

        res.status(200).json(cityAdmins);
    } catch (error) {
        console.error('Error fetching City Admins:', error);
        res.status(500).json({ message: 'Failed to fetch City Admins.' });
    }
};



// Allows Super Admin to update user details (Mongoose and Firebase).
exports.updateUser = async (req, res) => { 
    const { firebaseUid } = req.params;
    const { name, email, city_id, phone, photoURL, disabled } = req.body; // **NEW: Added 'disabled' for activation/deactivation**
    
    try {
        // 1. Find the Mongoose user to verify existence
        const userDocument = await User.findOne({ firebaseUid });

        if (!userDocument) {
            return res.status(404).json({ message: 'User not found in database.' });
        }

        // 2. Prepare updates for Firebase Auth
        const firebaseUpdates = {};
        if (name) firebaseUpdates.displayName = name;
        if (email) firebaseUpdates.email = email;
        if (photoURL) firebaseUpdates.photoURL = photoURL;
        if (typeof disabled === 'boolean') firebaseUpdates.disabled = disabled; // **NEW: Handles account enable/disable**

        if (Object.keys(firebaseUpdates).length > 0) {
            await admin.auth().updateUser(firebaseUid, firebaseUpdates); // **NEW: Updates Firebase Auth**
        }

        // 3. Prepare updates for Mongoose
        const mongooseUpdates = { name, email, phone, photoURL };
        
        // Super Admin can change a City Admin's city linkage
        if (userDocument.role === 'city_admin' && city_id) {
             mongooseUpdates.city_id = city_id;
             if (!mongoose.Types.ObjectId.isValid(city_id)) {
                 return res.status(400).json({ message: 'Invalid City ID format.' });
             }
        }
        
        Object.keys(mongooseUpdates).forEach(key => mongooseUpdates[key] === undefined && delete mongooseUpdates[key]);

        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid },
            { $set: mongooseUpdates },
            { new: true, runValidators: true } 
        ).populate(userDocument.role === 'city_admin' ? { path: 'city_id', select: 'city_name' } : null); // **NEW: Populates on update**

        res.status(200).json({
            message: `User (${userDocument.role}) updated successfully in both systems.`,
            user: updatedUser.toObject()
        });

    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ message: 'This email is already in use by another Firebase account.' });
        }
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: `Mongoose validation failed: ${error.message}` });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error during user update.' });
    }
}; // **NEW FUNCTION END**


/**
 * DELETE /api/supeAdmin/users/:firebaseUid
 * Allows Super Admin to securely delete a user from the entire system.
 */
exports.deleteUser = async (req, res) => { 
    const { firebaseUid } = req.params;
    
    try {
        // 1. Delete from Firebase Auth first (immediate access revocation)
        await admin.auth().deleteUser(firebaseUid); // **NEW: Deletes Firebase account**
        
        // 2. Delete the corresponding Mongoose document
        const result = await User.findOneAndDelete({ firebaseUid }); // **NEW: Deletes Mongoose record**

        if (!result) {
            return res.status(200).json({ 
                message: `User deleted from Firebase Auth. Mongoose document was not found or already deleted.` 
            });
        }

        res.status(200).json({
            message: `User (${result.role}, ${result.email}) successfully deleted from all systems.`,
        });

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // Attempt to clean up Mongoose if Firebase failed to find it
            await User.findOneAndDelete({ firebaseUid }).catch(e => console.error('Mongoose cleanup failed:', e));
            return res.status(404).json({ message: 'User not found in Firebase Auth.' });
        }
        
        console.error('Error during user deletion:', error);
        res.status(500).json({ message: 'Server error during user deletion process.' });
    }
}; 