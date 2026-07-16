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
