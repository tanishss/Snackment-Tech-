const User = require("../models/User");
const Order = require("../models/Order");


/* ==========================================================
   GET ALL CUSTOMERS — ADMIN
========================================================== */

exports.getAllCustomersForAdmin = async (req, res) => {

    try {

        const customers =
            await User.aggregate([

                /* ------------------------------------------------
                   Get all users
                ------------------------------------------------ */

                {
                    $match: {}
                },


                /* ------------------------------------------------
                   Match orders belonging to this user
                ------------------------------------------------ */

                {
                    $lookup: {
                        from: "orders",

                        localField: "_id",

                        foreignField: "user",

                        as: "orders"
                    }
                },


                /* ------------------------------------------------
                   Customer statistics
                ------------------------------------------------ */

                {
                    $addFields: {

                        totalOrders: {
                            $size: "$orders"
                        },

                        totalSpent: {
                            $sum: "$orders.pricing.total"
                        },

                        lastOrderDate: {
                            $max: "$orders.createdAt"
                        }

                    }
                },


                /* ------------------------------------------------
                   Remove sensitive / unnecessary fields
                ------------------------------------------------ */

                {
                    $project: {

                        _id: 1,

                        name: 1,

                        phone: 1,

                        email: 1,

                        hostel: 1,

                        room: 1,

                        address: 1,

                        createdAt: 1,

                        totalOrders: 1,

                        totalSpent: 1,

                        lastOrderDate: 1

                    }
                },


                /* ------------------------------------------------
                   Newest customers first
                ------------------------------------------------ */

                {
                    $sort: {
                        createdAt: -1
                    }
                }

            ]);


        /* ======================================================
           RESPONSE
        ====================================================== */

        return res.status(200).json({

            success: true,

            count:
                customers.length,

            customers

        });

    } catch (error) {

        console.error(
            "Get Admin Customers Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch customers."

        });

    }

};