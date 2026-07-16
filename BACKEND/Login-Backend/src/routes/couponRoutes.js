const express = require("express");
const router = express.Router();

const Coupon = require("../models/Coupon");
const calculateBill = require("../utils/billCalculator");

// ===========================
// GET ALL ACTIVE COUPONS
// ===========================

router.get("/", async (req, res) => {

    try {

        const coupons = await Coupon.find({
            isActive: true
        }).sort({
            minOrder: 1
        });

        res.json(coupons);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to load coupons"
        });

    }

});
// =====================================
// APPLY COUPON
// POST /api/coupon/apply
// =====================================

router.post("/apply", async (req, res) => {

    try {

        const { code, subtotal } = req.body;

        const coupon = await Coupon.findOne({

            code: code.toUpperCase(),
            isActive: true

        });

        if (!coupon) {

            return res.status(404).json({

                success: false,
                message: "Coupon not found"

            });

        }

        if (subtotal < coupon.minOrder) {

            return res.status(400).json({

                success: false,
                message: `Minimum order ₹${coupon.minOrder}`

            });

        }

        const bill = calculateBill(subtotal, coupon);

res.json({

    success: true,

    coupon,

    bill

});

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: "Coupon Apply Failed"

        });

    }

});
module.exports = router;