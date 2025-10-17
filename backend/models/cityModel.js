const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema(
  {
    city_name: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
    },
    boundary: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    center: {
      lat: Number,
      lng: Number,
    },
    address: {
      type: String,
      default: "",
    },
    city_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "city_admin",
      unique: true,
    },
  },
  { timestamps: true }
);

CitySchema.index({ city_name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("City", CitySchema);
