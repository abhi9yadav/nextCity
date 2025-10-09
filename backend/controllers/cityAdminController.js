const admin = require("firebase-admin");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const DeptAdmin = require("../models/deptAdminModel");
const Department = require("../models/departmentModel");
const CityAdmin = require("../models/cityAdminModel");
const Complaint = require("../models/complaintModel");
const Zone = require("../models/zoneModel");

exports.getComplaintsByDepartmentZone = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    // console.log("cityAdminUid"+cityAdminUid);
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    // console.log("cityAdmin"+cityAdmin);
    if (!cityAdmin)
      return res.status(403).json({ message: "Unauthorized: CityAdmin not found" });

    const { departmentId, zoneId } = req.params;
    // console.log("departmentId",departmentId);
    // console.log("zoneId",zoneId);
    const zone = await Zone.findOne({
      _id: zoneId,
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    });

    if (!zone) {
      return res.status(404).json({ message: "Zone not found in your city for this department" });
    }
    console.log("zone"+zone);

    const complaints = await Complaint.find({
      // concernedDepartment: { $exists: true },
      location: {
        $geoWithin: {
          $geometry: zone.geographical_boundary,
        },
      },
    }).populate("createdBy", "name email");

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Error fetching complaints for zone:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDepartmentAdminByDepartmentId = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });
    }

    const { departmentId } = req.params;

    const departmentAdmin = await User.findOne({
      role: "dept_admin",
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    }).populate("department_id", "department_name");

    if (!departmentAdmin) {
      return res.status(404).json({
        message: "No DepartmentAdmin found for this department in your city",
      });
    }

    res.status(200).json({ departmentAdmin });
  } catch (error) {
    console.error("Error fetching DepartmentAdmin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createDepartmentAdmin = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });
    }

    const { departmentId } = req.params;
    const { email, name, phone, photoURL } = req.body;

    if (!email || !name) {
      return res
        .status(400)
        .json({ message: "Email and name are required." });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    const existingDeptAdmin = await DeptAdmin.findOne({
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    });
    if (existingDeptAdmin) {
      return res.status(409).json({
        message:
          "A DepartmentAdmin already exists for this department in your city.",
      });
    }

    const tempPassword = new mongoose.Types.ObjectId().toString();
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName: name,
      password: tempPassword,
    });

    const firebaseUid = firebaseUser.uid;

    const deptAdminData = {
      firebaseUid,
      email,
      name,
      role: "dept_admin",
      phone,
      photoURL,
      city_id: cityAdmin.city_id,
      department_id: departmentId,
    };

    const newDeptAdmin = new DeptAdmin(deptAdminData);
    await newDeptAdmin.save();

    res.status(201).json({
      message: "DepartmentAdmin created successfully.",
      deptAdmin: newDeptAdmin,
    });
  } catch (error) {
    console.error("Error creating DepartmentAdmin:", error);

    if (error.code === "auth/email-already-exists") {
      return res
        .status(409)
        .json({ message: "A user with this email already exists in Firebase." });
    }

    res
      .status(500)
      .json({ message: "Server error during DepartmentAdmin creation." });
  }
};

exports.updateDepartmentAdmin = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });
    }

    const { firebaseUid } = req.params;
    const { name, email, phone, photoURL, department_id } = req.body;

    const deptAdmin = await DeptAdmin.findOne({
      firebaseUid,
      city_id: cityAdmin.city_id,
    });
    if (!deptAdmin) {
      return res
        .status(404)
        .json({ message: "DepartmentAdmin not found in your city." });
    }

    if (
      department_id &&
      department_id.toString() !== deptAdmin.department_id.toString()
    ) {
      const existingForDept = await DeptAdmin.findOne({
        city_id: cityAdmin.city_id,
        department_id,
      });
      if (existingForDept) {
        return res.status(409).json({
          message: "A DepartmentAdmin already exists for this department.",
        });
      }
    }

    const firebaseUpdates = {};
    if (name) firebaseUpdates.displayName = name;
    if (email) firebaseUpdates.email = email;
    if (photoURL) firebaseUpdates.photoURL = photoURL;

    if (Object.keys(firebaseUpdates).length > 0) {
      await admin.auth().updateUser(firebaseUid, firebaseUpdates);
    }

    const updates = { name, email, phone, photoURL, department_id };
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    const updatedDeptAdmin = await DeptAdmin.findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { new: true }
    ).populate("department_id", "department_name");

    res.status(200).json({
      message: "DepartmentAdmin updated successfully.",
      deptAdmin: updatedDeptAdmin,
    });
  } catch (error) {
    console.error("Error updating DepartmentAdmin:", error);
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ message: "This email is already in use." });
    }
    res
      .status(500)
      .json({ message: "Server error during DepartmentAdmin update." });
  }
};

exports.deleteDepartmentAdmin = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });
    }

    const { firebaseUid } = req.params;

    const deptAdmin = await DeptAdmin.findOne({
      firebaseUid,
      city_id: cityAdmin.city_id,
    });
    if (!deptAdmin) {
      return res
        .status(404)
        .json({ message: "DepartmentAdmin not found in your city." });
    }

    await admin
      .auth()
      .deleteUser(firebaseUid)
      .catch((err) => {
        console.warn("Firebase deletion failed:", err.message);
      });

    await DeptAdmin.deleteOne({ firebaseUid });

    res.status(200).json({
      message: `DepartmentAdmin (${deptAdmin.email}) successfully deleted.`,
    });
  } catch (error) {
    console.error("Error deleting DepartmentAdmin:", error);
    res
      .status(500)
      .json({ message: "Server error during DepartmentAdmin deletion." });
  }
};
