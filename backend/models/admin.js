const User = require("./user");

const adminSchema = new mongoose.Schema({
  permissions: { type: [String], default: ["manage_users", "manage_complaints"] }
});

const Admin = User.discriminator("admin", adminSchema);

module.exports = Admin;
