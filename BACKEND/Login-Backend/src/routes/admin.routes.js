const express = require("express");

const {
    sendAdminOTP,
    verifyAdminOTP,
    getAdminProfile
} = require("../controllers/admin.controller");

const {
    getAllOrdersForAdmin,
    updateOrderStatusForAdmin
} = require("../controllers/order.controller");

const adminAuth =
    require("../middlewares/admin.middleware");

const {
    getAllCustomersForAdmin
} = require("../controllers/adminCustomer.controller");
const {
    getAllCouponsForAdmin,
    createCouponForAdmin,
    toggleCouponForAdmin,
    updateCouponForAdmin
} = require("../controllers/adminCoupon.controller");
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
   GET ALL ORDERS — ADMIN
========================================================== */

router.get(
    "/orders",
    adminAuth,
    getAllOrdersForAdmin
);


/* ==========================================================
   UPDATE ORDER STATUS — ADMIN
========================================================== */

router.patch(
    "/orders/:orderId/status",
    adminAuth,
    updateOrderStatusForAdmin
);

/* ==========================================================
   GET ALL CUSTOMERS — ADMIN
========================================================== */

router.get(
    "/customers",
    adminAuth,
    getAllCustomersForAdmin
);


/* ==========================================================
   GET ALL COUPONS — ADMIN
========================================================== */

router.get(
    "/coupons",
    adminAuth,
    getAllCouponsForAdmin
);


/* ==========================================================
   CREATE COUPON — ADMIN
========================================================== */

router.post(
    "/coupons",
    adminAuth,
    createCouponForAdmin
);


/* ==========================================================
   UPDATE COUPON — ADMIN
========================================================== */

router.patch(
    "/coupons/:code",
    adminAuth,
    updateCouponForAdmin
);


/* ==========================================================
   TOGGLE COUPON — ADMIN
========================================================== */

router.patch(
    "/coupons/:code/toggle",
    adminAuth,
    toggleCouponForAdmin
);
/* ==========================================================
   Export Router
========================================================== */

module.exports = router;