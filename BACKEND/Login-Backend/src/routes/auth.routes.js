console.log("AUTH ROUTES LOADED");
const express = require("express");
const router = express.Router();

const {
    checkPhone,
    checkEmail,
    resetPassword,
    register,
    login
} = require("../controllers/auth.controller");

router.post("/check-phone", checkPhone);
router.post("/check-email", checkEmail);
router.post("/register", register);
router.post("/login", login);

router.patch("/reset-password", resetPassword);

module.exports = router;