const User = require("../models/userModel");
require("../models/citizenModel");

const signup = async (req, res) => {
  try {
    // console.log("here");
    const { uid, email, name, picture } = req.user;
    const { role, phone, department, ward } = req.body;
    // console.log("req.body:",req.body);
    // console.log("req.user:",req.user);

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

    console.log("yaha tak aa gaye\n");
    // console.log("userData:"+userData);
    // console.log("userData.firebaseUid:"+userData.firebaseUid);
    const user = await User.create(userData); // Simple insertion
    // console.log("user:"+user);

    // console.log("Inserted user:", user);
    res.status(200).json({ message: "✅ Signup successful", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};


const login = async (req, res) => {
  try {
    // console.log("req.user:", req.user);
    const { firebaseUid } = req.user;
    let user = await User.findOne({ firebaseUid });
    // console.log("user:"+user);

    if (!user) {
      return res.status(404).json({ message: "User not found, please signup" });
    }

    res.json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login };
