const User = require("./user");

const officerSchema = new mongoose.Schema({
  address: { 
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    zip: { type: String, required: true }
  },
  department: { type: String, required: true },
  ward: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" }
});

const Officer = User.discriminator("officer", officerSchema);

module.exports = Officer;
