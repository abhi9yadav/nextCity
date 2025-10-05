const mongoose = require("mongoose");

const options = { 
  discriminatorKey: "role", // tells Mongoose which model type
  timestamps: true 
};

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phone: { type: String, trim: true },
    photoURL: { type: String },
    role: {
      type: String,
      required: true, // Must be set for all documents
      default: "citizen",
    },
  },
  options
);

const User = mongoose.model("User", userSchema);

module.exports = User;
