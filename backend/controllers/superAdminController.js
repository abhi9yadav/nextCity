const City = require("../models/cityModel");
const Department = require("../models/departmentModel");
const User = require("../models/userModel");
const CityAdmin = require("../models/cityAdminModel");
const DeptAdmin = require("../models/deptAdminModel");
const Worker = require("../models/workerModel");
const { sendInvitation } = require("./invitationController");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const admin = require("firebase-admin");
const mongoose = require("mongoose");

const DISCRIMINATOR_MODELS = {
  super_admin: User.discriminators.super_admin,
  city_admin: CityAdmin,
  dept_admin: DeptAdmin,
  worker: Worker,
};

exports.createCity = async (req, res) => {
  try {
    let { city_name, state, country, boundary, center } = req.body;

    if (!city_name)
      return res.status(400).json({ message: "City name is required." });
    if (!state) return res.status(400).json({ message: "State is required." });

    if (!boundary || !boundary.coordinates || boundary.type !== "Polygon") {
      return res.status(400).json({ message: "Invalid boundary data." });
    }

    const newCity = new City({
      city_name,
      state,
      country: country || "India",
      boundary: boundary,
      center: center || null,
      address: boundary.address || "",
    });

    await newCity.save();

    res.status(201).json({
      message: "City created successfully.",
      city: newCity.toObject(),
    });
  } catch (error) {
    console.error("Error creating city:", error);
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { department_name, description } = req.body;

    if (!department_name) {
      return res.status(400).json({ message: "Department name is required." });
    }

    // Upload image to Cloudinary
    let photoURL = null;
    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "departments", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const uploadResult = await uploadToCloudinary(req.file.buffer);
      photoURL = uploadResult.secure_url;
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

exports.createUser = async (req, res) => {
  const { email, name, role, city_id, phone } = req.body;
  const photoFile = req.file;

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

  if (["city_admin"].includes(role) && !city_id) {
    return res
      .status(400)
      .json({ message: `${role} creation requires a city_id.` });
  }

  let firebaseUser;
  try {
    const city = await City.findById(city_id);
    if (!city) {
      return res.status(404).json({ message: "City not found." });
    }

    if (city.city_admin) {
      return res.status(400).json({
        message: `This city already has an assigned admin.`,
      });
    }

    let photoURL = null;
    if (photoFile) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "city_admins" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(photoFile.buffer).pipe(uploadStream);
      });
      photoURL = uploadResult.secure_url;
    }

    const tempPassword = new mongoose.Types.ObjectId().toString();

    firebaseUser = await admin.auth().createUser({
      email: email,
      displayName: name,
      password: tempPassword,
      disabled: true,
    });

    const firebaseUid = firebaseUser.uid;

    const userData = {
      firebaseUid,
      email,
      name,
      role,
      city_id,
      city_name: city.city_name,
      phone,
      photoURL,
      invitationSent: false,
      isActive: false,
    };
    const newUserDocument = new TargetModel(userData);
    await newUserDocument.save();

    city.city_admin = newUserDocument._id;
    await city.save();

    req.params.firebaseUid = firebaseUid;
    return await sendInvitation(req, res, false);
  } catch (error) {
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
    const cities = await City.find({});
    res.status(200).json({
      total: cities.length,
      cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Failed to fetch cities." });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    const departmentsWithImages = departments.map((dept) => {
      return {
        ...dept.toObject(),
        photoURL:
          dept.photoURL || "https://via.placeholder.com/400x300?text=No+Image",
      };
    });

    res.status(200).json({
      total: departmentsWithImages.length,
      departments: departmentsWithImages,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments." });
  }
};

exports.getAllCityAdmins = async (req, res) => {
  try {
    const cityAdmins = await CityAdmin.find({})
      .populate({ path: "city_id", select: "city_name" })
      .select("+firebaseUid -__v")
      .lean();

    res.status(200).json({
      total: cityAdmins.length,
      admins: cityAdmins,
    });
  } catch (error) {
    console.error("Error fetching City Admins:", error);
    res.status(500).json({ message: "Failed to fetch City Admins." });
  }
};

exports.getOneCityAdmin = async (req, res) => {
  try {
    const { cityAdminId } = req.params;
    const cityAdmin = await CityAdmin.findById(cityAdminId).select(
      "name email phone city_id city_name isActive"
    );
    if (!cityAdmin) {
      return res.status(404).json({ message: "CityAdmin not found." });
    }

    res.status(200).json(cityAdmin);
  } catch (error) {
    console.error("Error fetching cityAdmin profile:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

exports.updateUser = async (req, res) => {
  const { firebaseUid } = req.params;
  const { name, email, city_id, phone, disabled } = req.body;
  const photoFile = req.file;

  try {
    const userDocument = await User.findOne({ firebaseUid });

    if (!userDocument) {
      return res.status(404).json({ message: "User not found in database." });
    }

    let photoURL = undefined;
    if (photoFile) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "user_photos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const uploadResult = await uploadToCloudinary(photoFile.buffer);
      photoURL = uploadResult.secure_url;
    }

    const firebaseUpdates = {};
    if (name) firebaseUpdates.displayName = name;
    if (email) firebaseUpdates.email = email;
    if (photoURL) firebaseUpdates.photoURL = photoURL;
    if (typeof disabled === "boolean") firebaseUpdates.disabled = disabled;

    if (Object.keys(firebaseUpdates).length > 0) {
      await admin.auth().updateUser(firebaseUid, firebaseUpdates);
    }

    const mongooseUpdates = { name, email, phone, photoURL };
    if (photoURL) mongooseUpdates.photoURL = photoURL;

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

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { department_name, description } = req.body;

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found." });

    if (req.file) {
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "departments", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const uploadResult = await uploadToCloudinary(req.file.buffer);
      department.photoURL = uploadResult.secure_url;
    }

    if (department_name) department.department_name = department_name;
    if (description) department.description = description;

    await department.save();

    res.status(200).json({
      message: "Department updated successfully.",
      department: department.toObject(),
    });
  } catch (error) {
    console.error("Error updating department:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A department with this name already exists." });
    }
    res
      .status(500)
      .json({ message: "Server error while updating department." });
  }
};

exports.deleteUser = async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (e) {
        if (e.code !== "auth/user-not-found") throw e;
      }
      return res.status(404).json({ message: "User not found in database." });
    }

    if (user.role === "city_admin" && user.city_id) {
      await City.findByIdAndUpdate(user.city_id, {
        $unset: { city_admin: "" },
      });
    }

    try {
      await admin.auth().deleteUser(firebaseUid);
    } catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
    }

    await User.findOneAndDelete({ firebaseUid });

    res.status(200).json({
      message: `User (${user.role}, ${user.email}) successfully deleted and unlinked from related city.`,
    });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res
      .status(500)
      .json({ message: "Server error during user deletion process." });
  }
};

exports.deleteCity = async (req, res) => {
  const { cityId } = req.params;

  try {
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found." });
    }

    // If the city has a city_admin, delete that user first
    if (city.city_admin) {
      const adminDoc = await CityAdmin.findById(city.city_admin);

      if (adminDoc) {
        // Delete from Firebase only if firebaseUid is valid
        if (
          adminDoc.firebaseUid &&
          typeof adminDoc.firebaseUid === "string" &&
          adminDoc.firebaseUid.trim() !== ""
        ) {
          try {
            await admin.auth().deleteUser(adminDoc.firebaseUid);
          } catch (e) {
            if (e.code !== "auth/user-not-found") {
              console.error("Error deleting admin from Firebase:", e);
            }
          }
        } else {
          console.warn(
            `Skipping Firebase deletion — invalid firebaseUid for ${adminDoc.email}`
          );
        }

        await CityAdmin.findByIdAndDelete(city.city_admin);
      }
    }

    await City.findByIdAndDelete(cityId);

    res.status(200).json({
      message: `City '${city.city_name}' and its associated City Admin (if any) have been deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ message: "Server error while deleting city." });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    await Department.findByIdAndDelete(departmentId);

    res.status(200).json({
      message: `Department '${department.department_name}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting department." });
  }
};
