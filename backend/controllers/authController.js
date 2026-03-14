const User = require("../models/userModel");
const Email = require("../utils/email");
require("../models/citizenModel");


const signup = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const { role, phone, department, ward } = req.body;

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      return res.status(200).json({
        message: "User already exists. Logged in successfully.",
        user,
      });
    }

    const userData = {
      firebaseUid: uid,
      name: name || "Anonymous",
      email,
      phone: phone || "",
      photoURL: picture || "",
      role: role || "citizen",
      department: role === "officer" ? department : undefined,
      ward: role === "officer" ? ward : undefined,
      status: role === "officer" ? "pending" : "approved",
    };

    user = await User.create(userData);

    // Send welcome email
    // try {
    //   const logoUrl = process.env.APP_LOGO_URL;
    //   const dashboardURL = `${process.env.CLIENT_URL}`;
    //   await new Email(user, dashboardURL, {logoUrl}).sendWelcome();
    // } catch (err) {
    //   console.error("WELCOME EMAIL FAILED 💥", err);
    // }
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found, please signup" });
    }

    res.json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login };
