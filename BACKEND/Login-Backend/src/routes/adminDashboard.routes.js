const express = require("express");

const router = express.Router();

const {
    getDashboard
} = require("../controllers/adminDashboard.controller");


/* ==========================================================
   Dashboard
========================================================== */

router.get(
    "/",
    getDashboard
);


module.exports = router;