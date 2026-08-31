const Coupon = require("../models/Coupon");


/* ==========================================================
   GET PUBLIC COUPONS — USER
   ----------------------------------------------------------
   Returns only coupons that are:
   - active
   - public
   - visible on site
   - not expired
========================================================== */

exports.getPublicCoupons = async (req, res) => {

    try {

        const now = new Date();

        const coupons =
            await Coupon.find({

                isActive: true,

                couponType: "public",

                showOnSite: true,

                $or: [
                    {
                        expiry: null
                    },
                    {
                        expiry: {
                            $gt: now
                        }
                    }
                ]

            })
                .sort({
                    createdAt: -1
                })
                .select(
                    "code title description minOrder discountType discountValue expiry usageLimit usedCount"
                );


        /* ======================================================
           REMOVE FULLY USED COUPONS
        ====================================================== */

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


        res.json({

            success: true,

            coupons:
                availableCoupons

        });

    } catch (error) {

        console.error(
            "Get Public Coupons Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch coupons."

        });

    }

};


/* ==========================================================
   GET COUPON BY CODE — USER
   ----------------------------------------------------------
   Used when user manually enters a coupon code.

   IMPORTANT:
   Private coupons can still be validated here.
   They are simply NOT shown in the public coupon list.
========================================================== */

exports.getCouponByCode = async (req, res) => {

    try {

        const code =
            String(
                req.params.code
            )
                .trim()
                .toUpperCase();


        const coupon =
            await Coupon.findOne({
                code
            });


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Invalid coupon code."

            });

        }


        /* ======================================================
           ACTIVE CHECK
        ====================================================== */

        if (!coupon.isActive) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon is currently inactive."

            });

        }


        /* ======================================================
           EXPIRY CHECK
        ====================================================== */

        if (
            coupon.expiry &&
            coupon.expiry <= new Date()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon has expired."

            });

        }


        /* ======================================================
           TOTAL USAGE LIMIT
        ====================================================== */

        if (
            coupon.usageLimit !== null &&
            coupon.usedCount >=
                coupon.usageLimit
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon usage limit has been reached."

            });

        }


        /* ======================================================
           RESPONSE
        ====================================================== */

        res.json({

            success: true,

            coupon: {

                code:
                    coupon.code,

                title:
                    coupon.title,

                description:
                    coupon.description,

                minOrder:
                    coupon.minOrder,

                discountType:
                    coupon.discountType,

                discountValue:
                    coupon.discountValue,

                expiry:
                    coupon.expiry

            }

        });

    } catch (error) {

        console.error(
            "Get Coupon By Code Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to validate coupon."

        });

    }

};