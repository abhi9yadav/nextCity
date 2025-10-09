const mongoose = require("mongoose");

const ZoneSchema = new mongoose.Schema(
  {
    zone_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // CityAdmin
      required: true,
    },
    color: {
      type: String,
      default: "#3388ff",
    },
    geographical_boundary: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // [[[lng, lat], [lng, lat], ...]]
        required: true,
      },
    },
  },
  { timestamps: true }
);

ZoneSchema.index({ geographical_boundary: "2dsphere" });

const Zone = mongoose.model("Zone", ZoneSchema);

module.exports = Zone;
