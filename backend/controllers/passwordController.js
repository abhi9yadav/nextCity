const { verifyJwt, hashToken, signToken } = require("../utils/token");
const admin = require("firebase-admin");
const User = require("../models/userModel");
const Email = require("../utils/email");

exports.setPasswordWithToken = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Token and password required" });

  try {
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.uid) throw new Error("Invalid token payload");

    const passwordResetToken = hashToken(token);
    const user = await User.findOne({
      firebaseUid: decoded.uid,
      passwordResetToken,
    }).withSensitiveFields();;

    if (!user)
      return res.status(400).json({ message: "Invalid or already used token" });
    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Update password in Firebase and enable account
    await admin.auth().updateUser(decoded.uid, {
      password: password,
      disabled: false,
    });

    // set any other flags in Mongo
    user.isActive = true;
    user.invitationSent = true;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.json({
      message: "Password set and account activated",
      email: user.email,
    });
  } catch (err) {
    console.error("setPasswordWithToken error", err);
    return res.status(400).json({ message: "Failed to set password" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    const tokenExpiryMinutes = process.env.TOKEN_EXPIRES_MINUTES || 60;
    const token = signToken(
      { uid: user.firebaseUid, purpose: "reset" },
      `${tokenExpiryMinutes}m`
    );

    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = Date.now() + tokenExpiryMinutes * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${encodeURIComponent(token)}`;
    await new Email({ email: user.email, name: user.name }, resetLink).sendPasswordReset();

    res.json({ message: "Password reset email sent successfully" });
  } catch (err) {
    console.error("forgotPassword error", err);
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

