const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    concernedDepartment: {
      type: String,
      enum: [
        "Department of Power Supply",
        "Department of Water Management",
        "Department of Roads and Infrastructure",
        "Department of Sanitation and Waste Management",
        "Department of Drainage and Sewage",
        "Department of Parks and Green Spaces",
        "Department of Public Health",
        "Department of General Services",
      ],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true },
      address: { type: String },
    },
    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        thumbnail: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "REOPENED"],
      default: "OPEN",
    },
    votes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    history: [
      {
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        action: {
          type: String,
          required: true,
        },
        from: { type: String },
        to: { type: String },
        note: { type: String },
        timeStamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ city_id: 1 });
complaintSchema.index({ department_id: 1 });
complaintSchema.index({ city_id: 1, department_id: 1 });
complaintSchema.index({ city_id: 1, department_id: 1, status: 1 });
complaintSchema.index({ zone_id: 1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
