const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.saveProfile = async (req, res) => {
  try {
    const { name, email, hostel, room, address } = req.body;

    if (!name || !email || !hostel || !room || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        email,
        hostel,
        room,
        address,
        isProfileComplete: true
      },
      { new: true }
    );

    res.json({
      message: "Profile saved successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile save failed" });
  }
};
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to load profile"
    });

  }

};
exports.updateName = async (req, res) => {

  try {

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name.trim()
      },
      {
        new: true
      }
    ).select("name phone email hostel room address");

    res.json({
      message: "Name updated successfully",
      user
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to update name"
    });

  }

};


exports.updatePhone = async (req, res) => {

  try {

    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit phone number"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        phone: phone.trim()
      },
      {
        new: true
      }
    ).select("name phone email hostel room address");

    res.json({
      message: "Phone number updated successfully",
      user
    });

  } catch (err) {

    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "This phone number already exists."
      });
    }

    res.status(500).json({
      message: "Failed to update phone number"
    });

  }

};

exports.updatePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        message: "Password must be at least 5 characters long."
      });
    }

    const user = await User.findById(req.userId);

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password changed successfully."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to change password."
    });

  }

};