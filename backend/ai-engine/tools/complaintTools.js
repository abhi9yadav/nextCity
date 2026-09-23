const Complaint = require("../../models/complaintModel");

const getComplaintStats = async ({ user }) => {
    const match = {};

    if (user.role === "city_admin") {
        match.city_id = user.city_id;
    }

    else if (user.role === "dept_admin") {
        match.city_id = user.city_id;
        match.department_id = user.department_id;
    }

    else if (user.role === "worker") {
        match.city_id = user.city_id;
        match.department_id = user.department_id;
        match.zone_id = user.zone_id;
    }

    else if (user.role === "citizen") {
        match.createdBy = user._id;
    }

    const stats = await Complaint.aggregate([
        { $match: match },

        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    return stats;
};

const getMyComplaints = async ({ user }) => {
  const complaints = await Complaint.find({
    createdBy: user._id,
  })
    .select("title description status concernedDepartment createdAt location.address")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    total: complaints.length,
    complaints,
  };
}

const getDepartmentComplaints = async ({ user }) => {
  const filter = {};

  switch (user.role) {
    case "super_admin":
      break;

    case "city_admin":
      filter.city_id = user.city_id;
      break;

    case "dept_admin":
      filter.city_id = user.city_id;
      filter.department_id = user.department_id;
      break;

    case "worker":
      filter.city_id = user.city_id;
      filter.department_id = user.department_id;
      filter.zone_id = user.zone_id;
      break;

    default:
      throw new Error("You are not authorized to access department complaints.");
  }

  const complaints = await Complaint.find(filter)
    .select(
      "title description status concernedDepartment createdAt location.address"
    )
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    total: complaints.length,
    complaints,
  };
};

module.exports = {
    getComplaintStats,
    getMyComplaints,
    getDepartmentComplaints,
};