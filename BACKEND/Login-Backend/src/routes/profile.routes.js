const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const {
    saveProfile,
    updateName,
    updatePhone,
    updatePassword
} = require("../controllers/profile.controller");

router.post("/", auth, saveProfile);
router.patch("/name", auth, updateName);
router.patch("/phone", auth, updatePhone);
router.patch("/password", auth, updatePassword);

module.exports = router;
