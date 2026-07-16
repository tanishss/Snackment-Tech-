const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOTP, getOTPExpiry } = require('../services/otp.service');
const { sendOTP } = require('../services/sms.service'); // 👈 ADD THIS

/**
 * SEND OTP
 * POST /api/auth/send-otp
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number required' });
    }

    let user = await User.findOne({ phone });

    // ⏱️ COOLDOWN: 30 seconds
    const COOLDOWN = 30 * 1000;

    if (user && user.lastOtpSentAt) {
      const diff = Date.now() - user.lastOtpSentAt.getTime();
      if (diff < COOLDOWN) {
        const wait = Math.ceil((COOLDOWN - diff) / 1000);
        return res.status(429).json({
          message: `Please wait ${wait}s before requesting OTP again`
        });
      }
    }

    const otp = generateOTP();

    if (!user) {
      user = new User({ phone });
    }

    user.otp = otp;
    user.otpExpiresAt = getOTPExpiry();
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendOTP(phone, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * VERIFY OTP
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      isProfileComplete: user.isProfileComplete
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
