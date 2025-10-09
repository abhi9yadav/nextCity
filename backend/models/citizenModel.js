const mongoose = require("mongoose");
const User = require("./userModel");

const citizenSchema = new mongoose.Schema({
  address: { type: String },
  complaints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complaint" }]
});

const Citizen = User.discriminator("Citizen", citizenSchema);

module.exports = Citizen;