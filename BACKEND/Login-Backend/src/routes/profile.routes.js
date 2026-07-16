const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { saveProfile } = require("../controllers/profile.controller");

router.post("/", auth, saveProfile);

module.exports = router;
