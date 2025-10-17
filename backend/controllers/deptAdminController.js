const mongoose = require("mongoose");
const DeptAdmin = require("../models/deptAdminModel");
const admin = require("firebase-admin");
const { sendInvitation } = require("./invitationController");
const Complaint = require("../models/complaintModel");
const Zone = require("../models/zoneModel");
const { logActivity } = require("../utils/activityLogger");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Worker = mongoose.model("worker");

//For Dashboard Data
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  try {
    // 1️ DeptAdmin scope
    const deptAdmin = await DeptAdmin.findOne({
      firebaseUid: req.user.firebaseUid,
    })
      .select("+city_id +department_id")
      .exec();

    if (!deptAdmin)
      return next(new AppError("DeptAdmin scope not found.", 403));
    if (!deptAdmin.city_id || !deptAdmin.department_id)
      return next(
        new AppError("City or Department ID missing for DeptAdmin.", 400)
      );

    const city_id = new mongoose.Types.ObjectId(deptAdmin.city_id);
    const department_id = new mongoose.Types.ObjectId(deptAdmin.department_id);

    // 2️ Run all aggregations in parallel
    const [
      workerAggResult,
      complaintAggResult,
      topComplaints,
      topWorkers,
      zoneLoadAgg,
    ] = await Promise.all([
      // Worker aggregation
      Worker.aggregate([
        { $match: { city_id, department_id } },
        {
          $group: {
            _id: "$zone_id",
            workerCount: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        {
          $group: {
            _id: null,
            totalWorkers: { $sum: "$workerCount" },
            avgRating: { $avg: "$avgRating" },
            zoneWorkers: {
              $push: { zoneId: "$_id", workerCount: "$workerCount" },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalWorkers: 1,
            avgRating: { $round: ["$avgRating", 1] },
            zoneWorkers: 1,
          },
        },
      ]),

      // Complaint aggregation: total + breakdown
      Complaint.aggregate([
        { $match: { city_id, department_id } },
        {
          $group: {
            _id: null,
            totalComplaints: { $sum: 1 },
            complaintsOpen: {
              $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] },
            },
            complaintsInProgress: {
              $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
            },
            complaintsResolved: {
              $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
            },
            complaintsReopened: {
              $sum: { $cond: [{ $eq: ["$status", "REOPENED"] }, 1, 0] },
            },
          },
        },
      ]),

      // Top 5 complaints by votes
      Complaint.aggregate([
        { $match: { city_id, department_id } },
        { $addFields: { votesCount: { $size: { $ifNull: ["$votes", []] } } } },
        { $sort: { votesCount: -1, createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            votesCount: 1,
            status: 1,
            createdAt: 1,
            "createdBy.name": 1,
            "assignedTo.name": 1,
          },
        },
      ]),

      // Top 5 workers
      Worker.find({ city_id, department_id })
        .sort({ rating: -1 })
        .limit(5)
        .select("name email phone rating assignedCount zone_id photoURL")
        .lean(),

      // Top 3 zones by complaint load
      Complaint.aggregate([
        { $match: { city_id, department_id } },
        { $group: { _id: "$zone_id", complaints: { $sum: 1 } } },
        { $sort: { complaints: -1 } },
        {
          $lookup: {
            from: "zones",
            localField: "_id",
            foreignField: "_id",
            as: "zone",
          },
        },
        { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            let: { zoneId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$zone_id", "$$zoneId"] },
                      { $eq: ["$city_id", city_id] },
                      { $eq: ["$department_id", department_id] },
                    ],
                  },
                },
              },
              { $count: "workerCount" },
            ],
            as: "workers",
          },
        },
        { $unwind: { path: "$workers", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            zone_id: "$_id",
            zone_name: "$zone.zone_name",
            complaints: 1,
            totalWorkers: { $ifNull: ["$workers.workerCount", 0] },
          },
        },
      ]),
    ]);

    const complaintData = complaintAggResult[0] || {
      totalComplaints: 0,
      complaintsOpen: 0,
      complaintsInProgress: 0,
      complaintsResolved: 0,
      complaintsReopened: 0,
    };

    const totalComplaints = complaintData.totalComplaints || 1;
    const complaintsOpen = complaintData.complaintsOpen || 0;
    const complaintsInProgress = complaintData.complaintsInProgress || 0;
    const complaintsResolved = complaintData.complaintsResolved || 0;
    const complaintsReopened = complaintData.complaintsReopened || 0;

    // Calculate percentages safely
    const percentages = {
      open: ((complaintsOpen / totalComplaints) * 100).toFixed(2),
      inProgress: ((complaintsInProgress / totalComplaints) * 100).toFixed(2),
      resolved: ((complaintsResolved / totalComplaints) * 100).toFixed(2),
      reopened: ((complaintsReopened / totalComplaints) * 100).toFixed(2),
    };

    const statusBreakdown = [
      {
        name: "OPEN",
        count: complaintData.complaintsOpen,
        percentage: percentages.open || 0,
        fill: "#3b82f6",
      },
      {
        name: "IN_PROGRESS",
        count: complaintData.complaintsInProgress,
        percentage: percentages.inProgress || 0,
        fill: "#f59e0b",
      },
      {
        name: "RESOLVED",
        count: complaintData.complaintsResolved,
        percentage: percentages.resolved || 0,
        fill: "#10b981",
      },
      {
        name: "REOPENED",
        count: complaintData.complaintsReopened,
        percentage: percentages.reopened || 0,
        fill: "#f11717ff",
      },
    ];

    const workerData = workerAggResult[0] || {
      totalWorkers: 0,
      avgRating: 4.0,
      zoneWorkers: [],
    };

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalComplaints,
          complaintsInProgress,
          totalWorkers: workerData.totalWorkers,
          averageWorkerRating: workerData.avgRating,
        },
        statusBreakdown,
        zoneLoad: zoneLoadAgg,
        topComplaints,
        topWorkers,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return next(new AppError(err.message || "Internal Server Error", 500));
  }
});

// **************  Worker Management  ****************************************

exports.createWorker = catchAsync(async (req, res, next) => {
  let { email, name, phone, photoURL, zone_id } = req.body;
  if (!photoURL) {
    photoURL = `${
      process.env.BACKEND_URL || "http://localhost:5001/api/v1/"
    }images/default-profile.jpg`;
  }

  if (!zone_id)
    return next(new AppError("zone_id is required to create a worker.", 400));

  // 1️ Fetch DeptAdmin to get city_id and department_id
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid");
  if (!deptAdmin) return next(new AppError("DeptAdmin not found.", 403));

  const city_id = deptAdmin.city_id;
  const department_id = deptAdmin.department_id;

  // 2️ Create temporary Firebase account
  let tempPassword = Math.random().toString(36).slice(-8);
  tempPassword = "user@123"; // Hardcoded for testing
  let firebaseUser;

  try {
    firebaseUser = await admin.auth().createUser({
      email,
      displayName: name,
      password: tempPassword,
      disabled: false, // true in production
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return next(new AppError("Email already exists in Firebase.", 409));
    }
    return next(error);
  }

  // 3️ Create Mongoose Worker
  const workerData = {
    firebaseUid: firebaseUser.uid,
    email,
    name,
    phone,
    photoURL,
    role: "worker",
    city_id,
    department_id,
    zone_id,
    invitationSent: false,
    isActive: true,
  };

  try {
    const newWorker = new Worker(workerData);
    await newWorker.save();

    // Log activity
    try {
      await logActivity({
        req,
        userId: deptAdmin._id,
        role: "dept_admin",
        action: "WORKER_CREATED",
        targetUserId: newWorker._id,
        details: `Worker ${name} (${email}) created`,
        meta: { zone_id },
      });
    } catch (err) {
      console.error("Activity logging failed:", err);
    }

    // 4️ Send invitation email
    req.params.firebaseUid = firebaseUser.uid;
    await sendInvitation(req, res, false);

    return res.status(201).json({
      status: "success",
      message: `Worker created successfully. Invitation email will be sent to ${email} later.`,
      worker: newWorker,
    });
  } catch (err) {
    // Rollback Firebase user if MongoDB save fails
    if (firebaseUser?.uid) {
      await admin
        .auth()
        .deleteUser(firebaseUser.uid)
        .catch(() => {});
    }
    return next(new AppError("Failed to create worker in database.", 500));
  }
});

exports.getWorkers = catchAsync(async (req, res, next) => {
  // 1️ Fetch DeptAdmin
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  })
    .select("+firebaseUid +city_id +department_id")
    .exec();

  if (!deptAdmin) {
    return next(new AppError("DeptAdmin not found.", 403));
  }

  // 2️ Base filter: city & department
  const filter = {
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
  };

  // 3️ Optional zone filter
  const zoneId = req.query.zoneId?.trim();
  if (zoneId) {
    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      return next(new AppError("Invalid zoneId format.", 400));
    }
    filter.zone_id = new mongoose.Types.ObjectId(zoneId);
  }

  const countQuery = Worker.find(filter);
  const totalResults = await countQuery.countDocuments();

  // 4️ Build query with APIFeatures
  const WORKER_SEARCH_FIELDS = ["name", "email"];
  const features = new APIFeatures(
    Worker.find(filter),
    req.query,
    false,
    WORKER_SEARCH_FIELDS
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // 5️ Execute query
  const workers = await features.query.exec();

  // 6️ Send response
  res.status(200).json({
    status: "success",
    results: totalResults,
    workers,
  });
});

exports.getWorker = catchAsync(async (req, res, next) => {
  const { firebaseUid } = req.params;

  const worker = await Worker.findOne({ firebaseUid })
    .select("-__v -password")
    .exec();

  if (!worker) {
    return next(new AppError("Worker not found", 404));
  }

  res.status(200).json({
    status: "success",
    worker,
  });
});

exports.getWorkerDetails = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId)
      .populate("city_id", "city_name")
      .populate("department_id", "department_name")
      .populate("zone_id", "zone_name");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const complaints = await Complaint.find({ assignedTo: workerId })
      .populate("createdBy", "name email")
      .populate("zone_id", "zone_name")
      .sort({ createdAt: -1 });

    const totalAssigned = complaints.length;
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    const inProgress = complaints.filter(
      (c) => c.status === "IN_PROGRESS"
    ).length;

    res.status(200).json({
      worker,
      stats: { totalAssigned, resolved, inProgress },
      complaints,
    });
  } catch (error) {
    console.error("Error fetching worker details:", error);
    res.status(500).json({ message: "Failed to fetch worker details." });
  }
};

exports.updateWorker = catchAsync(async (req, res, next) => {
  let { workerId } = req.params;
  const { name, email, phone, photoURL, disabled, zone_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return next(new AppError("Invalid Worker ID format.", 400));
  }

  workerId = new mongoose.Types.ObjectId(workerId);

  // 1️ Fetch DeptAdmin
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid");
  if (!deptAdmin)
    return next(new AppError("Unauthorized: DeptAdmin not found.", 403));

  // 2️ Fetch Worker within DeptAdmin scope
  const worker = await Worker.findOne({
    _id: workerId,
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
  });

  if (!worker)
    return next(new AppError("Worker not found or outside your scope.", 403));

  // 3️ Prepare Firebase updates
  const firebaseUpdates = {};
  if (name) firebaseUpdates.displayName = name;
  if (email) firebaseUpdates.email = email;
  if (photoURL) firebaseUpdates.photoURL = photoURL;
  if (typeof disabled === "boolean") firebaseUpdates.disabled = disabled;

  // 4️ Prepare Mongoose updates
  const allowedUpdates = { name, email, phone, photoURL, zone_id };
  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  const updatedWorker = await Worker.findOneAndUpdate(
    { _id: workerId },
    { $set: allowedUpdates },
    { new: true }
  )
    .select(
      "name email phone photoURL zone_id workerId city_id department_id isActive"
    )
    .lean();

  // Log activity
  try {
    await logActivity({
      req,
      userId: deptAdmin._id,
      role: "dept_admin",
      action: "WORKER_UPDATED",
      targetUserId: updatedWorker._id,
      details: `Worker ${updatedWorker.name} (${updatedWorker.email}) updated`,
      meta: { changes: allowedUpdates },
    });
  } catch (err) {
    console.error("Activity logging failed:", err);
  }

  res.status(200).json({
    status: "success",
    message: "Worker updated successfully.",
    worker: updatedWorker,
  });
});

exports.deleteWorker = catchAsync(async (req, res, next) => {
  let { workerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return next(new AppError("Invalid Worker ID format.", 400));
  }

  workerId = new mongoose.Types.ObjectId(workerId);

  // 1️ Fetch DeptAdmin
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid");
  if (!deptAdmin) return next(new AppError("DeptAdmin not found.", 403));

  // 2️ Fetch Worker within DeptAdmin scope
  const worker = await Worker.findOne({
    _id: workerId,
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
  }).withSensitiveFields();

  if (!worker)
    return next(new AppError("Worker not found or outside your scope.", 403));

  // 3️ Delete Firebase user
  try {
    await admin.auth().deleteUser(worker.firebaseUid);
  } catch (error) {
    console.error("Failed to delete Firebase user:", error);
  }

  // 4️ Delete Worker from MongoDB
  await Worker.findOneAndDelete({ _id:workerId });

  // Log activity
  try {
    await logActivity({
      req,
      userId: deptAdmin._id,
      role: "dept_admin",
      action: "WORKER_DELETED",
      targetUserId: worker._id,
      details: `Worker ${worker.name} (${worker.email}) deleted`,
    });
  } catch (err) {
    console.error("Activity logging failed:", err);
  }

  res.status(200).json({
    status: "success",
    message: "Worker deleted successfully.",
  });
});

exports.resendWorkerInvitation = catchAsync(async (req, res, next) => {
  let { workerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return next(new AppError("Invalid Worker ID format.", 400));
  }
  workerId = new mongoose.Types.ObjectId(workerId);

  // 1️ Fetch DeptAdmin
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid");
  if (!deptAdmin) return next(new AppError("DeptAdmin not found.", 403));

  // 2️ Fetch Worker within DeptAdmin scope
  const worker = await Worker.findOne({
    _id: workerId,
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
  }).withSensitiveFields();

  if (!worker)
    return next(new AppError("Worker not found or outside your scope.", 403));

  // 3️ Resend invitation
  try {
    req.params.firebaseUid = worker.firebaseUid;
    await sendInvitation(req, res, true);
  } catch (err) {
    console.error(
      "Invitation sending skipped due to Mailtrap/email limit.",
      err
    );
    return next(
      new AppError(
        `Worker found, but invitation email could not be sent. (Mail system may be limited)`,
        200
      )
    );
  }
  // Log activity
  try {
    await logActivity({
      req,
      userId: deptAdmin._id,
      role: "dept_admin",
      action: "WORKER_INVITATION_RESENT",
      targetUserId: worker._id,
      details: `Invitation email resent to worker ${worker.name} (${worker.email})`,
    });
  } catch (err) {
    console.error("Activity logging failed:", err);
  }

  res.status(200).json({
    status: "success",
    message: `Invitation process triggered for worker ${worker.name} (${worker.email}).`,
  });
});

//***************  Complaint Management **************** */

exports.getComplaints = catchAsync(async (req, res, next) => {
  //1️ Fetch DeptAdmin
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid +city_id +department_id");

  if (!deptAdmin) {
    return next(new AppError("DeptAdmin not found.", 403));
  }

  // 2 Prepare base filter (by department and optional status)
  const baseFilter = {
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
  };

  // 3 Handle zone-based filtering

  let zoneFilterStage = [];
  if (req.query.zoneId) {
    const zoneId = req.query.zoneId.trim();

    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      return next(new AppError("Invalid zoneId format.", 400));
    }

    zoneFilterStage.push({
      $match: { zone_id: new mongoose.Types.ObjectId(zoneId) },
    });
  } else {
    const zones = await Zone.find({
      city_id: deptAdmin.city_id,
      department_id: deptAdmin.department_id,
    }).select("_id");

    if (zones.length) {
      const zoneIds = zones.map((z) => z._id);
      zoneFilterStage.push({ $match: { zone_id: { $in: zoneIds } } });
    }
  }

  // 4️ Initial Pipeline Setup
  let pipeline = [{ $match: baseFilter }, ...zoneFilterStage];
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true },
    }
  );

  // --- COUNTING (Total results matching all filters but NOT paginated) ---
  const COMPLAINT_SEARCH_FIELDS = [
    "_id",
    "title",
    "description",
    "createdBy.name",
    "createdBy.email",
  ];
  const countFeatures = new APIFeatures(
    [...pipeline],
    req.query,
    true,
    COMPLAINT_SEARCH_FIELDS
  ).filter();

  const totalCountPipeline = [...countFeatures.query, { $count: "totalCount" }];
  const totalCountResult = await Complaint.aggregate(totalCountPipeline);
  const totalResults = totalCountResult[0]?.totalCount || 0;

  // --- DATA FETCH (The actual paginated and sorted results) ---

  // 5️ Add votes field for sorting
  pipeline.push({
    $addFields: { votesCount: { $size: { $ifNull: ["$votes", []] } } },
  });

  // 6️ Apply remaining API features (pagination, sorting, etc.)
  const features = new APIFeatures(
    pipeline,
    req.query,
    true,
    COMPLAINT_SEARCH_FIELDS
  )
    .filter()
    .sort()
    .sortByVotes()
    .paginate();

  // 7️ Final Lookups and Projection
  features.query.push(
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedToWorker",
      },
    },
    {
      $unwind: { path: "$assignedToWorker", preserveNullAndEmptyArrays: true },
    },

    {
      $lookup: {
        from: "zones",
        localField: "zone_id",
        foreignField: "_id",
        as: "zoneDetail",
      },
    },
    { $unwind: { path: "$zoneDetail", preserveNullAndEmptyArrays: true } },

    // Project final fields
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        createdAt: 1,
        votesCount: 1,
        zone_id: "$zone_id",
        zoneName: "$zoneDetail.zone_name",
        createdBy: {
          _id: "$createdBy._id",
          name: "$createdBy.name",
          email: "$createdBy.email",
        },
        assignedTo: {
          _id: { $ifNull: ["$assignedToWorker._id", null] },
          name: { $ifNull: ["$assignedToWorker.name", "Unassigned"] },
        },
      },
    }
  );

  // 8️ Execute aggregation
  const complaints = await Complaint.aggregate(features.query);

  // 9️ Send response
  res.status(200).json({
    status: "success",
    results: totalResults,
    complaints,
  });
});

exports.getComplaintDetails = catchAsync(async (req, res, next) => {
  const { complaintId } = req.params;

  if (!complaintId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid complaint ID", 400));
  }

  const complaint = await Complaint.findById(complaintId)
    .populate("createdBy", "name email phone")
    .populate("assignedTo", "name email phone")
    .populate("history.by", "name email role")
    .populate("zone_id", "zone_name")
    .populate("department_id", "department_name")
    .populate("city_id", "city_name");

  if (!complaint) {
    return next(new AppError("Complaint not found", 404));
  }

  if (
    req.user.department_id.toString() !==
      complaint.department_id._id.toString() ||
    req.user.city_id.toString() !== complaint.city_id._id.toString()
  ) {
    return next(new AppError("Not authorized to view this complaint", 403));
  }

  res.status(200).json({
    status: "success",
    complaint,
  });
});

// 1) Get candidate workers for a particular complaint
exports.getCandidateWorkers = catchAsync(async (req, res, next) => {
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  })
    .select("+firebaseUid +city_id +department_id")
    .exec();

  if (!deptAdmin) return next(new AppError("DeptAdmin not found", 403));

  const { complaintId } = req.params;
  const complaint = await Complaint.findById(complaintId).lean();
  if (!complaint) return next(new AppError("Complaint not found", 404));

  // 1️ Find the zone that contains the complaint
  const zone = await Zone.findById(complaint.zone_id).exec();

  if (!zone)
    return next(
      new AppError("No zone found that contains this complaint", 404)
    );

  // 2️ Find candidate workers in that zone
  const limit = parseInt(req.query.limit, 10) || 5;

  const candidates = await Worker.find({
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
    zone_id: zone._id,
    isAvailable: true,
  })
    .sort({ assignedCount: 1, rating: -1 })
    .limit(limit)
    .select("-password -__v");

  res.status(200).json({
    status: "success",
    results: candidates.length,
    candidates,
  });
});

// 2) Assign complaint to a worker
exports.assignComplaintToWorker = catchAsync(async (req, res, next) => {
  const { complaintId } = req.params;
  const workerId = req.body?.workerId;

  // 1️ DeptAdmin validation
  const deptAdmin = await DeptAdmin.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("+firebaseUid +city_id +department_id");
  if (!deptAdmin) return next(new AppError("DeptAdmin not found", 403));

  // 2️ Complaint validation
  const complaint = await Complaint.findById(complaintId)
    .populate("createdBy", "name email")
    .lean();
  if (!complaint) return next(new AppError("Complaint not found", 404));

  // 3️ Zone containing complaint
  const zone = await Zone.findById(complaint.zone_id);

  if (!zone)
    return next(new AppError("No zone found containing this complaint", 404));

  // 4️ Candidate workers
  const candidates = await Worker.find({
    city_id: deptAdmin.city_id,
    department_id: deptAdmin.department_id,
    zone_id: zone._id,
    isAvailable: true,
  })
    .sort({ assignedCount: 1, rating: -1 })
    .limit(5);

  if (!candidates.length)
    return next(new AppError("No available workers in this zone", 404));

  // 5️ Determine assigned worker
  let assignedWorker;
  if (workerId) {
    assignedWorker = candidates.find((w) => w._id.toString() === workerId);
    if (!assignedWorker) {
      const maybe = await Worker.findOne({
        _id: workerId,
        city_id: deptAdmin.city_id,
        department_id: deptAdmin.department_id,
        zone_id: zone._id,
        isAvailable: true,
      });
      if (!maybe)
        return next(
          new AppError("Selected worker is not eligible for assignment", 400)
        );
      assignedWorker = maybe;
    }
  } else {
    assignedWorker = candidates[0];
  }

  // 6️ Transaction for DB updates
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        assignedTo: assignedWorker._id,
        status: "IN_PROGRESS",
        $push: {
          history: {
            by: deptAdmin._id,
            action: "status_changed",
            from: complaint.status || "OPEN",
            to: "IN_PROGRESS",
            note: workerId
              ? `Assigned to ${assignedWorker._id} (manual)`
              : `Auto-assigned to ${assignedWorker._id}`,
            timeStamp: new Date(),
          },
        },
      },
      { new: true, session }
    )
      .populate("assignedTo", "name email phone rating assignedCount zone_id")
      .lean();

    await Worker.findByIdAndUpdate(
      assignedWorker._id,
      { $inc: { assignedCount: 1 } },
      { session }
    );

    //Safe activity logging
    try {
      await logActivity({
        req,
        userId: deptAdmin._id,
        role: "dept_admin",
        action: workerId ? "MANUAL_ASSIGN" : "AUTO_ASSIGN",
        complaintId: complaint._id,
        targetUserId: assignedWorker._id,
        details: `Assigned complaint ${complaint._id} to worker ${assignedWorker._id}`,
        meta: {
          note: workerId ? "manual" : "auto",
          assignedWorkerEmail: assignedWorker.email,
          assignedWorkerPhone: assignedWorker.phone,
        },
        session,
      });
    } catch (logErr) {
      console.error("Activity logging failed:", logErr);
    }

    await session.commitTransaction();
    session.endSession();

    // 7️ Send notification emails (best-effort)
    // try {
    //   const citizen = complaint.createdBy;
    //   const complaintUrl = `${
    //     process.env.APP_URL || ""
    //   }/complaints/${complaintId}`;

    //   if (citizen?.email) {
    //     const citizenEmail = new Email(
    //       { email: citizen.email, name: citizen.name || "" },
    //       complaintUrl,
    //       {
    //         complaintTitle: complaint.title || "",
    //         complaintDescription: complaint.description || "",
    //         workerName: assignedWorker.name || "",
    //         workerPhone: assignedWorker.phone || "",
    //         workerEmail: assignedWorker.email || "",
    //         appName: process.env.APP_NAME || "NextCity",
    //       }
    //     );
    //     await citizenEmail.send(
    //       "workerAssignedCitizen",
    //       `Your complaint has been assigned — ${
    //         process.env.APP_NAME || "NextCity"
    //       }`
    //     );
    //   }

    //   if (assignedWorker?.email) {
    //     const workerEmail = new Email(
    //       { email: assignedWorker.email, name: assignedWorker.name || "" },
    //       complaintUrl,
    //       {
    //         complaintTitle: complaint.title || "",
    //         complaintDescription: complaint.description || "",
    //         citizenName: citizen?.name || "Citizen",
    //         citizenEmail: citizen?.email || "",
    //         location: complaint.location?.coordinates
    //           ? `Latitude: ${complaint.location.coordinates[1]}, Longitude: ${complaint.location.coordinates[0]}`
    //           : "Location not available",
    //         appName: process.env.APP_NAME || "NextCity",
    //       }
    //     );
    //     await workerEmail.send(
    //       "workerAssignedWorker",
    //       `You have been assigned a new complaint — ${
    //         process.env.APP_NAME || "NextCity"
    //       }`
    //     );
    //   }
    // } catch (emailErr) {
    //   console.error(
    //     "⚠️ Failed to send one or more assignment emails:",
    //     emailErr
    //   );
    // }

    const refreshedAssignedWorker = await Worker.findById(assignedWorker._id)
      .select("-password -__v")
      .lean();

    return res.status(200).json({
      status: "success",
      message: `Complaint successfully assigned to ${refreshedAssignedWorker.name}`,
      data: {
        complaint: updatedComplaint,
        assignedWorker: refreshedAssignedWorker,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(
      new AppError(
        "Failed to assign complaint: " + (err.message || "unknown"),
        500
      )
    );
  }
});
