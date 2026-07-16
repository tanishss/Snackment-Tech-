const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth.middleware");

// 👉 GET LOGGED IN USER ADDRESS
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId)
    .select("hostel room address name email");

  res.json(user);
});


module.exports = router;
