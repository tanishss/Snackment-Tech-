const express = require("express");

const {
    sendAdminOTP,
    verifyAdminOTP,
    getAdminProfile
} = require("../controllers/admin.controller");

const adminAuth =
    require("../middlewares/admin.middleware");


/* ==========================================================
   Router
========================================================== */

const router = express.Router();


/* ==========================================================
   Send Admin OTP
========================================================== */

router.post(
    "/send-otp",
    sendAdminOTP
);


/* ==========================================================
   Verify Admin OTP
========================================================== */

router.post(
    "/verify-otp",
    verifyAdminOTP
);


/* ==========================================================
   Get Admin Profile
========================================================== */

router.get(
    "/me",
    adminAuth,
    getAdminProfile
);


/* ==========================================================
   Export Router
========================================================== */

module.exports = router;