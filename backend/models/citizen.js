const User = require("./user");

const citizenSchema = new mongoose.Schema({
  address: { type: String },
  complaints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complaint" }]
});

const Citizen = User.discriminator("citizen", citizenSchema);

module.exports = Citizen;
