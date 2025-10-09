const { hashToken, verifyJwt } = require("../utils/token");
const User = require("../models/userModel");

exports.validateToken = async (req, res) => {
  const token = req.query.token;
  if (!token)
    return res.status(400).json({ valid: false, message: "No token provided" });

  try {
    const decoded = verifyJwt(token);
    // only allow invite/reset tokens
    if (!decoded || !decoded.uid) throw new Error("Invalid token");

    const passwordResetToken = hashToken(token);
    const user = await User.findOne({
      firebaseUid: decoded.uid,
      passwordResetToken,
    }).withSensitiveFields();

    if (!user)
      return res
        .status(400)
        .json({ valid: false, message: "Token not found or already used" });
    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ valid: false, message: "Token expired" });
    }

    return res.json({ valid: true, email: user.email, role: user.role });
  } catch (err) {
    console.error("validateToken error", err);
    return res.status(400).json({ valid: false, message: "Invalid token" });
  }
};
