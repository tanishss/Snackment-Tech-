const express = require("express");
const router = express.Router();

const Coupon = require("../models/Coupon");
const calculateBill = require("../utils/billCalculator");


// ==========================================================
// GET ALL PUBLIC ACTIVE COUPONS
// GET /api/coupon
// ==========================================================

router.get("/", async (req, res) => {

    try {

        const coupons = await Coupon.find({

            isActive: true,

            couponType: "public",

            showOnSite: true,

            $or: [
                {
                    expiry: null
                },
                {
                    expiry: {
                        $gt: new Date()
                    }
                }
            ]

        }).sort({

            minOrder: 1

        });


        // Remove coupons whose total usage limit is reached

        const availableCoupons =
            coupons.filter(coupon => {

                if (
                    coupon.usageLimit === null
                ) {

                    return true;

                }

                return (
                    coupon.usedCount <
                    coupon.usageLimit
                );

            });


        res.json(
            availableCoupons
        );


    } catch (err) {

        console.error(err);

        res.status(500).json({

            message:
                "Failed to load coupons"

        });

    }

});


// ==========================================================
// APPLY COUPON
// POST /api/coupon/apply
// ==========================================================

router.post("/apply", async (req, res) => {

    try {

        const {
            code,
            subtotal
        } = req.body;


        const coupon =
            await Coupon.findOne({

                code:
                    code.toUpperCase(),

                isActive: true

            });


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Coupon not found"

            });

        }


        // ----------------------------------------------------
        // EXPIRY CHECK
        // ----------------------------------------------------

        if (
            coupon.expiry &&
            coupon.expiry <= new Date()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Coupon expired"

            });

        }


        // ----------------------------------------------------
        // USAGE LIMIT CHECK
        // ----------------------------------------------------

        if (
            coupon.usageLimit !== null &&
            coupon.usedCount >=
                coupon.usageLimit
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Coupon usage limit reached"

            });

        }


        // ----------------------------------------------------
        // MINIMUM ORDER CHECK
        // ----------------------------------------------------

        if (
            subtotal <
            coupon.minOrder
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Minimum order ₹${coupon.minOrder}`

            });

        }


        // ----------------------------------------------------
        // CALCULATE BILL
        // ----------------------------------------------------

        const bill =
            calculateBill(
                subtotal,
                coupon
            );


        res.json({

            success: true,

            coupon,

            bill

        });


    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message:
                "Coupon Apply Failed"

        });

    }

});


module.exports = router;