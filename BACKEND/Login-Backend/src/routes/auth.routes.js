console.log("AUTH ROUTES LOADED");
const express = require("express");
const router = express.Router();

const {
    checkPhone,
    register,
    login
} = require("../controllers/auth.controller");

router.post("/check-phone", checkPhone);
router.post("/register", register);
router.post("/login", login);

module.exports = router;