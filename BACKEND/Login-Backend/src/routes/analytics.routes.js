const express = require("express");

const router = express.Router();

const adminAuth =
    require("../middlewares/admin.middleware");

const analyticsController =
    require("../controllers/analytics.controller");


/* ==========================================================
   SNACKMENT ADMIN
   ANALYTICS ROUTES
========================================================== */


/* ==========================================================
   GET ANALYTICS
========================================================== */

router.get(
    "/",
    adminAuth,
    analyticsController.getAnalytics
);


/* ==========================================================
   EXPORT ROUTER
========================================================== */

module.exports = router;