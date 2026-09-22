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

module.exports = {
    getComplaintStats
};