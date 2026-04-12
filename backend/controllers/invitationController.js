const User = require("../models/userModel");
const Email = require("../utils/email");
const { signToken, hashToken } = require("../utils/token");

// Send or resend an invitation email

exports.sendInvitation = async (firebaseUid, isResend = false) => {

  try {
    const user = await User.findOne({ firebaseUid }).withSensitiveFields();
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    const tokenExpiryMinutes = parseInt(process.env.TOKEN_EXPIRES_MINUTES || "60", 10);
    const token = signToken(
      { uid: user.firebaseUid, purpose: "invite", role: user.role },
      `${tokenExpiryMinutes}m`
    );

    const tokenHash = hashToken(token);

    user.passwordResetToken = tokenHash;
    user.passwordResetExpires = Date.now() + tokenExpiryMinutes * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/set-password?token=${encodeURIComponent(token)}`;

    let emailSent = false;

    try {
      const logoUrl = `${process.env.BACKEND_URL}/images/logo.png`;

      const emailInstance = new Email(
        { email: user.email, name: user.name },
        inviteLink,
        { role: user.role, logoUrl }
      );

      await emailInstance.sendInvitation();

      user.invitationSent = true;
      await user.save();
      emailSent = true;
    } catch (emailError) {
      console.error("Email failed to send:", emailError.message);
    }

    return {
      success: true,
      firebaseUid,
      inviteLink,
      emailSent,
      message: emailSent
        ? "Invitation sent successfully"
        : "User created but email failed",
    };
  } catch (error) {
    console.error("Send invitation failed:", error);
    return {
      success: false,
      message: "Internal server error while sending invitation",
    };
  }
};

//Resend invitation controller
exports.resendInvitation = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid }).withSensitiveFields();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // FIRE AND FORGET (non-blocking)
    setImmediate(() => {
      exports.sendInvitation(firebaseUid, true)
        .then((result) => {
          console.log("Resend email done:", result?.emailSent || true);
        })
        .catch((err) => {
          console.error("Resend email failed:", err.message);
        });
    });

    // immediate response
    return res.status(200).json({
      success: true,
      message: "Invitation resend triggered successfully",
    });

  } catch (error) {
    console.error("Resend invitation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend invitation",
    });
  }
};
