const User = require("./userModel");
const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema(
  {
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
      index: true,
    },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    assignedCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    skills: [{ type: String }],
    meta: { type: mongoose.Schema.Types.Mixed },  // extensible
  },
  { timestamps: true }
);

WorkerSchema.index({ city_id: 1, department_id: 1, zone_id: 1 });

const Worker = User.discriminator("worker", WorkerSchema);
module.exports = Worker;
