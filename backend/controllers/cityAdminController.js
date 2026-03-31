const admin = require("firebase-admin");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const DeptAdmin = require("../models/deptAdminModel");
const Department = require("../models/departmentModel");
const CityAdmin = require("../models/cityAdminModel");
const Complaint = require("../models/complaintModel");
const Zone = require("../models/zoneModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = async (fileBuffer, folder) => {
  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

exports.getCityAdminProfile = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({
      firebaseUid: cityAdminUid,
    }).select("name email city_id");
    if (!cityAdmin) {
      return res.status(404).json({ message: "CityAdmin not found." });
    }

    res.status(200).json({ name: cityAdmin.name, email: cityAdmin.email });
  } catch (error) {
    console.error("Error fetching cityAdmin profile:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

exports.getAllDepartmentsForCityAdmin = async (req, res) => {
  try {
    const departments = await Department.find({}).select("-__v");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments." });
  }
};

exports.getZonesByDepartment = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin)
      return res
        .status(403)
        .json({ message: "Unauthorized: CityAdmin not found" });

    const { departmentId } = req.params;

    const zones = await Zone.find({
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    }).select("_id zone_name");

    res.status(200).json({ zones });
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({ message: "Server error fetching zones" });
  }
};

exports.getAllComplaintsByDepartment = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized: CityAdmin not found" });
    }

    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    const zones = await Zone.find({
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    });

    if (!zones || zones.length === 0) {
      return res
        .status(404)
        .json({ message: "No zones found for this department in your city" });
    }

    const zoneBoundaries = zones.map((z) => z.geographical_boundary);

    const complaints = await Complaint.find({
      concernedDepartment: department.department_name,
      $or: zoneBoundaries.map((boundary) => ({
        location: { $geoWithin: { $geometry: boundary } },
      })),
    })
      .populate({ path: "createdBy", model: "User", select: "name email" })
      .select(
        "title description status votes location createdBy createdAt attachments",
      );

    const formattedComplaints = complaints.map((c) => {
      const cObj = c.toObject();
      return {
        ...cObj,
        votesCount: Array.isArray(cObj.votes) ? cObj.votes.length : 0,
      };
    });

    res.status(200).json({ complaints: formattedComplaints });
  } catch (error) {
    console.error("Error fetching department complaints:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComplaintsByDepartmentZone = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized: CityAdmin not found" });
    }

    const { departmentId, zoneId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    const zone = await Zone.findOne({
      _id: zoneId,
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    });

    if (!zone) {
      return res
        .status(404)
        .json({ message: "Zone not found in your city for this department" });
    }

    const complaints = await Complaint.find({
      concernedDepartment: department.department_name,
      location: { $geoWithin: { $geometry: zone.geographical_boundary } },
    }).populate({ path: "createdBy", model: "User", select: "name email" });

    const formattedComplaints = complaints.map((c) => {
      const cObj = c.toObject();
      return {
        ...cObj,
        votesCount: Array.isArray(cObj.votes) ? cObj.votes.length : 0,
      };
    });

    res.status(200).json({ complaints: formattedComplaints });
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
    })
      .populate("department_id", "department_name")
      .withSensitiveFields()
      .exec();

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
    if (!cityAdmin)
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });

    const { departmentId } = req.params;
    const { email, name, phone } = req.body;

    if (!email || !name)
      return res.status(400).json({ message: "Email and name are required." });

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found." });

    const existingDeptAdmin = await DeptAdmin.findOne({
      department_id: departmentId,
      city_id: cityAdmin.city_id,
    });
    if (existingDeptAdmin)
      return res.status(409).json({
        message:
          "A DepartmentAdmin already exists for this department in your city.",
      });

    // Upload photo if provided
    let photoURL = null;
    if (req.file) {
      photoURL = await uploadToCloudinary(req.file.buffer, "department_admins");
    }

    // Create Firebase user
    const tempPassword = new mongoose.Types.ObjectId().toString();
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName: name,
      password: tempPassword,
      photoURL: photoURL || undefined,
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

    const newDeptAdmin = await DeptAdmin.create(deptAdminData);

    res.status(201).json({
      message: "DepartmentAdmin created successfully.",
      deptAdmin: newDeptAdmin,
    });
  } catch (error) {
    console.error("Error creating DepartmentAdmin:", error);
    res
      .status(500)
      .json({ message: "Server error during DepartmentAdmin creation." });
  }
};

exports.updateDepartmentAdmin = async (req, res) => {
  try {
    const cityAdminUid = req.user.firebaseUid;
    const cityAdmin = await CityAdmin.findOne({ firebaseUid: cityAdminUid });
    if (!cityAdmin)
      return res
        .status(403)
        .json({ message: "CityAdmin not found or unauthorized." });

    const { firebaseUid } = req.params;
    const { name, email, phone, department_id } = req.body;

    const deptAdmin = await DeptAdmin.findOne({
      firebaseUid,
      city_id: cityAdmin.city_id,
    });
    if (!deptAdmin)
      return res
        .status(404)
        .json({ message: "DepartmentAdmin not found in your city." });

    // Upload new photo if provided
    if (req.file) {
      deptAdmin.photoURL = await uploadToCloudinary(
        req.file.buffer,
        "department_admins",
      );
    }

    if (name) deptAdmin.name = name;
    if (email) deptAdmin.email = email;
    if (phone) deptAdmin.phone = phone;
    if (department_id) deptAdmin.department_id = department_id;

    await deptAdmin.save();

    // Update Firebase
    const firebaseUpdates = {};
    if (name) firebaseUpdates.displayName = name;
    if (email) firebaseUpdates.email = email;
    if (deptAdmin.photoURL) firebaseUpdates.photoURL = deptAdmin.photoURL;

    if (Object.keys(firebaseUpdates).length > 0)
      await admin.auth().updateUser(firebaseUid, firebaseUpdates);

    res.status(200).json({
      message: "DepartmentAdmin updated successfully.",
      deptAdmin,
    });
  } catch (error) {
    console.error("Error updating DepartmentAdmin:", error);
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

exports.getDepartmentById = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Department.findById(departmentId).select("-__v");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Server error fetching department" });
  }
};

exports.getDepartmentStats = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const activeComplaints = await Complaint.countDocuments({
      concernedDepartment: department.department_name,
      status: { $in: ["OPEN", "IN_PROGRESS"] },
    });

    const resolvedThisMonth = await Complaint.countDocuments({
      concernedDepartment: department.department_name,
      status: "RESOLVED",
      updatedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const zonesManaged = await Zone.countDocuments({
      department_id: departmentId,
    });

    const newCount = await Complaint.countDocuments({
      concernedDepartment: department.department_name,
      status: "OPEN",
    });

    const inProgress = await Complaint.countDocuments({
      concernedDepartment: department.department_name,
      status: "IN_PROGRESS",
    });

    const resolved = await Complaint.countDocuments({
      concernedDepartment: department.department_name,
      status: "RESOLVED",
    });

    res.status(200).json({
      activeComplaints,
      resolvedThisMonth,
      zonesManaged,
      new: newCount,
      inProgress,
      resolved,
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

exports.getDepartmentRecentActivity = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Department.findById(departmentId);

    const complaints = await Complaint.find({
      concernedDepartment: department.department_name,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name");

    const activity = complaints.map((c) => ({
      message: `Complaint "${c.title}" filed by ${c.createdBy?.name || "User"}`,
    }));

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Server error fetching activity" });
  }
};

exports.getCityComplaintStats = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cityId = user.city_id;
    const cityName = user.city_name;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeComplaints = await Complaint.countDocuments({
      city_id: cityId,
      status: { $in: ["OPEN", "IN_PROGRESS", "REOPENED"] },
    });

    const resolvedLast30Days = await Complaint.countDocuments({
      city_id: cityId,
      status: "RESOLVED",
      updatedAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      activeComplaints,
      resolvedLast30Days,
      cityName,
    });
  } catch (error) {
    console.error("Error fetching city stats:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

exports.getCityDepartmentStats = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cityId = user.city_id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all departments of the city
    const departments = await Department.find({});

    // Aggregations
    const activeAgg = await Complaint.aggregate([
      {
        $match: {
          city_id: cityId,
          status: { $in: ["OPEN", "IN_PROGRESS", "REOPENED"] },
        },
      },
      {
        $group: {
          _id: "$concernedDepartment",
          count: { $sum: 1 },
        },
      },
    ]);

    const resolvedAgg = await Complaint.aggregate([
      {
        $match: {
          city_id: cityId,
          status: "RESOLVED",
          updatedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$concernedDepartment",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation to maps
    const activeMap = {};
    activeAgg.forEach((d) => {
      activeMap[d._id.toString()] = d.count;
    });

    const resolvedMap = {};
    resolvedAgg.forEach((d) => {
      resolvedMap[d._id.toString()] = d.count;
    });

    // Build final arrays including zero departments
    const activeByDept = departments.map((dept) => ({
      _id: dept.department_name,
      count: activeMap[dept.department_name] || 0,
    }));

    const resolvedByDept = departments.map((dept) => ({
      _id: dept.department_name,
      count: resolvedMap[dept.department_name] || 0,
    }));

    res.status(200).json({
      activeByDept,
      resolvedByDept,
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
