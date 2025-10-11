const User = require("../models/userModel");
const Email = require("../utils/email");
const { signToken, hashToken } = require("../utils/token");

// Send or resend an invitation email

exports.sendInvitation = async (req, res, isResend = false) => {
  const { firebaseUid } = req.params;

  try {
    // 1️ Fetch user with sensitive fields
    const user = await User.findOne({ firebaseUid }).withSensitiveFields();
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2️ Generate new JWT invite token
    const tokenExpiryMinutes = parseInt(process.env.TOKEN_EXPIRES_MINUTES || "60", 10);
    const token = signToken(
      { uid: user.firebaseUid, purpose: "invite", role: user.role },
      `${tokenExpiryMinutes}m`
    );

    const tokenHash = hashToken(token);

    user.passwordResetToken = tokenHash;
    user.passwordResetExpires = Date.now() + tokenExpiryMinutes * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 3️ Build frontend invite link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/set-password?token=${encodeURIComponent(token)}`;

    // 4️ Try sending the email
    try {
      const logoUrl = `${req.protocol}://${req.get("host")}/images/logo.png`;
      const emailInstance = new Email(
        { email: user.email, name: user.name },
        inviteLink,
        { role: user.role, logoUrl }
      );
      await emailInstance.sendInvitation();

      user.invitationSent = true;
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        message: isResend
          ? `Invitation resent successfully to ${user.email}.`
          : `User (${user.role}) created successfully. Invitation email sent.`,
        inviteLink, // for testing, remove in production
      });

    } catch (emailError) {
      console.error("Email failed to send:", emailError);

      return res.status(isResend ? 500 : 201).json({
        message: isResend
          ? "Resend failed. Please try again later."
          : "User created, but invitation email failed. You can resend later.",
        firebaseUid,
        inviteLink,
      });
    }

  } catch (error) {
    console.error("Send invitation failed:", error);
    res.status(500).json({ message: "Failed to send invitation." });
  }
};


exports.resendInvitation = async (req, res) => {
  req.body.isResend = true;
  await sendInvitation(req, res, true);
};
