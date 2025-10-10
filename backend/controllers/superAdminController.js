const City = require("../models/cityModel");
const Department = require("../models/departmentModel");
const User = require("../models/userModel");
const CityAdmin = require("../models/cityAdminModel");
const DeptAdmin = require("../models/deptAdminModel");
const Worker = require("../models/workerModel");
const { sendInvitation } = require("./invitationController");

const admin = require("firebase-admin");
const mongoose = require("mongoose");

const DISCRIMINATOR_MODELS = {
  super_admin: User.discriminators.super_admin,
  city_admin: CityAdmin,
  dept_admin: DeptAdmin,
  worker: Worker,
};

// --- Core Resource Management ---
exports.createCity = async (req, res) => {
  try {
    const { city_name, country } = req.body;

    if (!city_name) {
      return res.status(400).json({ message: "City name is required." });
    }

    const newCity = new City({ city_name, country });
    await newCity.save();

    res.status(201).json({
      message: "City created successfully.",
      city: newCity.toObject(),
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res
        .status(409)
        .json({ message: "A city with this name already exists." });
    }
    console.error("Error creating city:", error);
    res.status(500).json({ message: "Server error while creating city." });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { department_name, description, photoURL } = req.body;

    if (!department_name) {
      return res.status(400).json({ message: "Department name is required." });
    }

    const newDepartment = new Department({
      department_name,
      description,
      photoURL,
    });
    await newDepartment.save();

    res.status(201).json({
      message: "Department created successfully.",
      department: newDepartment.toObject(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A department with this name already exists." });
    }
    console.error("Error creating department:", error);
    res
      .status(500)
      .json({ message: "Server error while creating department." });
  }
};

// --- Delegated User Creation Logic (Super Admin) ---

exports.createUser = async (req, res) => {
  const { email, name, role, city_id, phone, photoURL } = req.body;

  // 1. Basic validation and role check
  if (!email || !name || !role) {
    return res
      .status(400)
      .json({ message: "Email, name, and role are required." });
  }

  if (role !== "city_admin") {
    return res
      .status(400)
      .json({ message: "here you can add only City Admin" });
  }

  const TargetModel = DISCRIMINATOR_MODELS[role];
  if (!TargetModel) {
    return res
      .status(400)
      .json({ message: `Invalid target role specified: ${role}.` });
  }

  // 2. Check if required hierarchy IDs are provided for the target role
  if (["city_admin"].includes(role) && !city_id) {
    return res
      .status(400)
      .json({ message: `${role} creation requires a city_id.` });
  }

  // 3. Create Temporary Firebase Account
  let firebaseUser;
  try {
    const tempPassword = new mongoose.Types.ObjectId().toString();

    firebaseUser = await admin.auth().createUser({
      email: email,
      displayName: name,
      password: tempPassword,
      disabled: true,
    });

    const firebaseUid = firebaseUser.uid;

    // 4. Create Mongoose user
    const userData = {
      firebaseUid,
      email,
      name,
      role,
      city_id,
      phone,
      photoURL,
      invitationSent: false,
      isActive: false,
    };
    const newUserDocument = new TargetModel(userData);
    await newUserDocument.save();

    //email invitation
    req.params.firebaseUid = firebaseUid;
    return await sendInvitation(req, res, false);
  } catch (error) {
    // Rollback Firebase user if something fails
    if (firebaseUser) {
      await admin
        .auth()
        .deleteUser(firebaseUser.uid)
        .catch((e) => console.error("Firebase rollback failed:", e));
    }

    if (error.code && error.code === "auth/email-already-exists") {
      return res.status(409).json({
        message: "A user with this email already exists in Firebase.",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res
        .status(400)
        .json({ message: `Data validation failed: ${error.message}` });
    }

    console.error("Error during user creation:", error);
    res
      .status(500)
      .json({ message: "Server error during user creation process." });
  }
};

exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find({}).select("-_id -__v");
    res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Failed to fetch cities." });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).select("-_id -__v");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments." });
  }
};

exports.getAllCityAdmins = async (req, res) => {
  try {
    const cityAdmins = await CityAdmin.find({})
      .populate({ path: "city_id", select: "city_name" })
      .select("-__v");

    res.status(200).json(cityAdmins);
  } catch (error) {
    console.error("Error fetching City Admins:", error);
    res.status(500).json({ message: "Failed to fetch City Admins." });
  }
};

// Allows Super Admin to update user details (Mongoose and Firebase).
exports.updateUser = async (req, res) => {
  const { firebaseUid } = req.params;
  const { name, email, city_id, phone, photoURL, disabled } = req.body;

  try {
    // 1. Find the Mongoose user to verify existence
    const userDocument = await User.findOne({ firebaseUid });

    if (!userDocument) {
      return res.status(404).json({ message: "User not found in database." });
    }

    // 2. Prepare updates for Firebase Auth
    const firebaseUpdates = {};
    if (name) firebaseUpdates.displayName = name;
    if (email) firebaseUpdates.email = email;
    if (photoURL) firebaseUpdates.photoURL = photoURL;
    if (typeof disabled === "boolean") firebaseUpdates.disabled = disabled;

    if (Object.keys(firebaseUpdates).length > 0) {
      await admin.auth().updateUser(firebaseUid, firebaseUpdates);
    }

    // 3. Prepare updates for Mongoose
    const mongooseUpdates = { name, email, phone, photoURL };

    // Super Admin can change a City Admin's city linkage
    if (userDocument.role === "city_admin" && city_id) {
      mongooseUpdates.city_id = city_id;
      if (!mongoose.Types.ObjectId.isValid(city_id)) {
        return res.status(400).json({ message: "Invalid City ID format." });
      }
    }

    Object.keys(mongooseUpdates).forEach(
      (key) => mongooseUpdates[key] === undefined && delete mongooseUpdates[key]
    );

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: mongooseUpdates },
      { new: true, runValidators: true }
    ).populate(
      userDocument.role === "city_admin"
        ? { path: "city_id", select: "city_name" }
        : null
    );

    res.status(200).json({
      message: `User (${userDocument.role}) updated successfully in both systems.`,
      user: updatedUser.toObject(),
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        message: "This email is already in use by another Firebase account.",
      });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: `Mongoose validation failed: ${error.message}` });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error during user update." });
  }
};

exports.deleteUser = async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    // 1. Delete from Firebase Auth first (immediate access revocation)
    await admin.auth().deleteUser(firebaseUid);

    // 2. Delete the corresponding Mongoose document
    const result = await User.findOneAndDelete({ firebaseUid });
    if (!result) {
      return res.status(200).json({
        message: `User deleted from Firebase Auth. Mongoose document was not found or already deleted.`,
      });
    }

    res.status(200).json({
      message: `User (${result.role}, ${result.email}) successfully deleted from all systems.`,
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // Attempt to clean up Mongoose if Firebase failed to find it
      await User.findOneAndDelete({ firebaseUid }).catch((e) =>
        console.error("Mongoose cleanup failed:", e)
      );
      return res
        .status(404)
        .json({ message: "User not found in Firebase Auth." });
    }

    console.error("Error during user deletion:", error);
    res
      .status(500)
      .json({ message: "Server error during user deletion process." });
  }
};
