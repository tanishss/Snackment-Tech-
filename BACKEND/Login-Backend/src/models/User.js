const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },

    // PROFILE DATA
  name: String,
  email: String,
  hostel: String,
  room: String,
  address: String,

  isProfileComplete: {
    type: Boolean,
    default: false
  },

  otp: String,
  otpExpiresAt: Date,
  lastOtpSentAt: Date,

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);