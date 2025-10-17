const mongoose = require("mongoose");

const options = { 
  discriminatorKey: "role",
  timestamps: true 
};

const userRoles = ['superAdmin', 'city_admin', 'dept_admin', 'worker', 'citizen'];

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phone: { type: String, trim: true },
    photoURL: { type: String },
    role: {
      type: String,
      required: true, 
      enum: userRoles,
      default: "citizen",
    },
    passwordChangedAt: { 
      type: Date,
      select: false,
    },
    passwordResetToken: { 
      type: String, 
      default: undefined,
      select: false, 
    },
    passwordResetExpires: { 
      type: Date, 
      default: undefined,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invitationSent: { type: Boolean, default: false },
  },
  options
);

userSchema.query.withSensitiveFields = function() {
  return this.select("+firebaseUid +passwordResetToken +passwordResetExpires +isActive");
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordChangedAt;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.firebaseUid,
    delete ret.__v;
    return ret;
  },
});


const User = mongoose.model("User", userSchema);

module.exports = User;
