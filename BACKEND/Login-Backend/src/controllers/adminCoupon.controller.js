const Coupon = require("../models/Coupon");


/* ==========================================================
   GET ALL COUPONS — ADMIN
========================================================== */

exports.getAllCouponsForAdmin = async (req, res) => {

    try {

        const coupons =
            await Coupon.find()
                .sort({
                    createdAt: -1
                });

        res.json({

            success: true,

            count:
                coupons.length,

            coupons

        });

    } catch (error) {

        console.error(
            "Get Admin Coupons Error:",
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
   CREATE COUPON — ADMIN
========================================================== */

exports.createCouponForAdmin = async (req, res) => {

    try {

        const {
            code,
            title,
            description,
            minOrder,
            discountType,
            discountValue,
            isActive,
            showOnSite,
            expiry,
            couponType,
            usageLimit,
            perCustomerLimit,
            assignedUsers
        } = req.body;


        /* ======================================================
           REQUIRED FIELDS
        ====================================================== */

        if (
            !code ||
            !title ||
            !description ||
            minOrder === undefined ||
            !discountType ||
            discountValue === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Code, title, description, minimum order, discount type and discount value are required."

            });

        }


        /* ======================================================
           DISCOUNT VALIDATION
        ====================================================== */

        if (
            !["flat", "percentage"]
                .includes(discountType)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid discount type."

            });

        }


        const numericDiscount =
            Number(discountValue);


        const numericMinOrder =
            Number(minOrder);


        if (
            !Number.isFinite(
                numericDiscount
            ) ||
            numericDiscount < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid discount value."

            });

        }


        if (
            !Number.isFinite(
                numericMinOrder
            ) ||
            numericMinOrder < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid minimum order value."

            });

        }


        /* ======================================================
           PERCENTAGE LIMIT
        ====================================================== */

        if (
            discountType === "percentage" &&
            numericDiscount > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Percentage discount cannot exceed 100%."

            });

        }


        /* ======================================================
           CHECK DUPLICATE CODE
        ====================================================== */

        const normalizedCode =
            String(code)
                .trim()
                .toUpperCase();


        const existingCoupon =
            await Coupon.findOne({
                code: normalizedCode
            });


        if (existingCoupon) {

            return res.status(409).json({

                success: false,

                message:
                    "Coupon code already exists."

            });

        }


        /* ======================================================
           COUPON TYPE
        ====================================================== */

        const finalCouponType =
            couponType === "private"
                ? "private"
                : "public";


        /* ======================================================
           PRIVATE COUPON
           ------------------------------------------------------
           Private coupons should normally not appear on site.
        ====================================================== */

        const finalShowOnSite =
            finalCouponType === "private"
                ? false
                : showOnSite !== false;


        /* ======================================================
           USAGE LIMIT
        ====================================================== */

        let finalUsageLimit = null;


        if (
            usageLimit !== undefined &&
            usageLimit !== null &&
            usageLimit !== ""
        ) {

            finalUsageLimit =
                Number(usageLimit);


            if (
                !Number.isInteger(
                    finalUsageLimit
                ) ||
                finalUsageLimit < 1
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Usage limit must be a positive whole number."

                });

            }

        }


        /* ======================================================
           PER CUSTOMER LIMIT
        ====================================================== */

        let finalPerCustomerLimit =
            null;


        if (
            perCustomerLimit !== undefined &&
            perCustomerLimit !== null &&
            perCustomerLimit !== ""
        ) {

            finalPerCustomerLimit =
                Number(perCustomerLimit);


            if (
                !Number.isInteger(
                    finalPerCustomerLimit
                ) ||
                finalPerCustomerLimit < 1
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Per customer limit must be a positive whole number."

                });

            }

        }


        /* ======================================================
           USER ASSIGNMENT
        ====================================================== */

        let finalAssignedUsers =
            Array.isArray(
                assignedUsers
            )
                ? assignedUsers
                : [];


        /*
         * Public coupons do not need assigned users.
         */

        if (
            finalCouponType === "public"
        ) {

            finalAssignedUsers = [];

        }


        /* ======================================================
           CREATE COUPON
        ====================================================== */

        const coupon =
            await Coupon.create({

                code:
                    normalizedCode,

                title:
                    String(title).trim(),

                description:
                    String(description).trim(),

                minOrder:
                    numericMinOrder,

                discountType,

                discountValue:
                    numericDiscount,

                isActive:
                    isActive !== false,

                showOnSite:
                    finalShowOnSite,

                expiry:
                    expiry
                        ? new Date(expiry)
                        : null,

                couponType:
                    finalCouponType,

                usageLimit:
                    finalUsageLimit,

                usedCount:
                    0,

                perCustomerLimit:
                    finalPerCustomerLimit,

                assignedUsers:
                    finalAssignedUsers

            });


        /* ======================================================
           RESPONSE
        ====================================================== */

        res.status(201).json({

            success: true,

            message:
                "Coupon created successfully.",

            coupon

        });

    } catch (error) {

        console.error(
            "Create Admin Coupon Error:",
            error
        );


        /* ======================================================
           DUPLICATE KEY SAFETY
        ====================================================== */

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Coupon code already exists."

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to create coupon."

        });

    }

};


/* ==========================================================
   TOGGLE COUPON — ADMIN
========================================================== */

exports.toggleCouponForAdmin = async (req, res) => {

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
                    "Coupon not found."

            });

        }


        coupon.isActive =
            !coupon.isActive;


        await coupon.save();


        res.json({

            success: true,

            message:
                coupon.isActive
                    ? "Coupon enabled successfully."
                    : "Coupon disabled successfully.",

            coupon

        });

    } catch (error) {

        console.error(
            "Toggle Admin Coupon Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update coupon status."

        });

    }

};


/* ==========================================================
   UPDATE COUPON — ADMIN
========================================================== */

exports.updateCouponForAdmin = async (req, res) => {

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
                    "Coupon not found."

            });

        }


        const {
            title,
            description,
            minOrder,
            discountType,
            discountValue,
            showOnSite,
            expiry,
            usageLimit,
            perCustomerLimit
        } = req.body;


        /* ======================================================
           BASIC FIELDS
        ====================================================== */

        if (
            title !== undefined
        ) {

            coupon.title =
                String(title).trim();

        }


        if (
            description !== undefined
        ) {

            coupon.description =
                String(description).trim();

        }


        /* ======================================================
           MIN ORDER
        ====================================================== */

        if (
            minOrder !== undefined
        ) {

            const value =
                Number(minOrder);


            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid minimum order value."

                });

            }


            coupon.minOrder =
                value;

        }


        /* ======================================================
           DISCOUNT
        ====================================================== */

        if (
            discountType !== undefined
        ) {

            if (
                !["flat", "percentage"]
                    .includes(discountType)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid discount type."

                });

            }


            coupon.discountType =
                discountType;

        }


        if (
            discountValue !== undefined
        ) {

            const value =
                Number(discountValue);


            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid discount value."

                });

            }


            if (
                coupon.discountType ===
                    "percentage" &&
                value > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Percentage discount cannot exceed 100%."

                });

            }


            coupon.discountValue =
                value;

        }


        /* ======================================================
           SHOW ON SITE
        ====================================================== */

        if (
            showOnSite !== undefined
        ) {

            coupon.showOnSite =
                Boolean(showOnSite);

        }


        /*
         * Private coupons should never be publicly shown.
         */

        if (
            coupon.couponType === "private"
        ) {

            coupon.showOnSite =
                false;

        }


        /* ======================================================
           EXPIRY
        ====================================================== */

        if (
            expiry !== undefined
        ) {

            coupon.expiry =
                expiry
                    ? new Date(expiry)
                    : null;

        }


        /* ======================================================
           USAGE LIMIT
        ====================================================== */

        if (
            usageLimit !== undefined
        ) {

            if (
                usageLimit === null ||
                usageLimit === ""
            ) {

                coupon.usageLimit =
                    null;

            } else {

                const value =
                    Number(usageLimit);


                if (
                    !Number.isInteger(value) ||
                    value < 1
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Usage limit must be a positive whole number."

                    });

                }


                if (
                    value < coupon.usedCount
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Usage limit cannot be lower than current usage."

                    });

                }


                coupon.usageLimit =
                    value;

            }

        }


        /* ======================================================
           PER CUSTOMER LIMIT
        ====================================================== */

        if (
            perCustomerLimit !== undefined
        ) {

            if (
                perCustomerLimit === null ||
                perCustomerLimit === ""
            ) {

                coupon.perCustomerLimit =
                    null;

            } else {

                const value =
                    Number(
                        perCustomerLimit
                    );


                if (
                    !Number.isInteger(value) ||
                    value < 1
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Per customer limit must be a positive whole number."

                    });

                }


                coupon.perCustomerLimit =
                    value;

            }

        }


        await coupon.save();


        res.json({

            success: true,

            message:
                "Coupon updated successfully.",

            coupon

        });

    } catch (error) {

        console.error(
            "Update Admin Coupon Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update coupon."

        });

    }

};