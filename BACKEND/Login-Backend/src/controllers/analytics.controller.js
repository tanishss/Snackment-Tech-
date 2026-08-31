const Order = require("../models/Order");
const User = require("../models/User");


/* ==========================================================
   SNACKMENT ADMIN
   ANALYTICS CONTROLLER
========================================================== */


/* ==========================================================
   INDIA TIMEZONE HELPERS
========================================================== */

/*
 * MongoDB stores Date values in UTC.
 *
 * Snackment is operating in India, so dashboard periods
 * should be calculated according to Asia/Kolkata.
 */

function getIndiaDateParts(date = new Date()) {

    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "Asia/Kolkata",

            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(date);


    const year =
        Number(
            parts.find(
                part => part.type === "year"
            ).value
        );


    const month =
        Number(
            parts.find(
                part => part.type === "month"
            ).value
        );


    const day =
        Number(
            parts.find(
                part => part.type === "day"
            ).value
        );


    return {
        year,
        month,
        day
    };

}


/*
 * Returns the UTC Date corresponding to midnight
 * in India for the supplied date.
 */

function getIndiaDayStart(date = new Date()) {

    const {
        year,
        month,
        day
    } = getIndiaDateParts(date);


    return new Date(
        Date.UTC(
            year,
            month - 1,
            day
        ) -
        (
            5.5 *
            60 *
            60 *
            1000
        )
    );

}


/* ==========================================================
   NUMBER HELPERS
========================================================== */

function roundNumber(
    value,
    decimals = 2
) {

    if (
        typeof value !== "number" ||
        Number.isNaN(value)
    ) {

        return 0;

    }


    const multiplier =
        Math.pow(
            10,
            decimals
        );


    return Math.round(
        value * multiplier
    ) / multiplier;

}


/* ==========================================================
   PERCENTAGE CHANGE
========================================================== */

function getPercentageChange(
    current,
    previous
) {

    if (previous === 0) {

        if (current === 0) {
            return 0;
        }

        return null;

    }


    return roundNumber(
        (
            (
                current -
                previous
            ) /
            previous
        ) *
        100,
        1
    );

}


function formatPercentageChange(
    value
) {

    if (value === null) {
        return null;
    }


    if (value > 0) {
        return `+${value}%`;
    }


    if (value < 0) {
        return `${value}%`;
    }


    return "0%";

}


/* ==========================================================
   MONTH LABEL
========================================================== */

function getMonthLabel(
    year,
    month
) {

    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                1
            )
        );


    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            timeZone: "UTC"
        }
    ).format(date);

}


/* ==========================================================
   HOUR LABEL
========================================================== */

function formatHour(
    hour
) {

    if (hour === 0) {
        return "12am";
    }


    if (hour < 12) {
        return `${hour}am`;
    }


    if (hour === 12) {
        return "12pm";
    }


    return `${hour - 12}pm`;

}


/* ==========================================================
   GET ANALYTICS
========================================================== */

exports.getAnalytics = async (
    req,
    res
) => {

    try {

        /* ======================================================
           CURRENT DATE
        ====================================================== */

        const now =
            new Date();


        const startOfToday =
            getIndiaDayStart(
                now
            );


        const startOfTomorrow =
            new Date(
                startOfToday.getTime() +
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );


        const startOfYesterday =
            new Date(
                startOfToday.getTime() -
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );


        /* ======================================================
           SIX MONTH PERIOD
        ====================================================== */

        const currentIndiaParts =
            getIndiaDateParts(
                now
            );


        /*
         * Start from the first day of the month,
         * five months before the current month.
         *
         * This gives us six months including the
         * current month.
         */

        const firstMonthDate =
            new Date(
                Date.UTC(
                    currentIndiaParts.year,
                    currentIndiaParts.month - 1 - 5,
                    1
                )
            );


        const firstMonthYear =
            firstMonthDate.getUTCFullYear();


        const firstMonth =
            firstMonthDate.getUTCMonth();


        /*
         * Convert midnight India time to UTC.
         */

        const sixMonthStart =
            new Date(
                Date.UTC(
                    firstMonthYear,
                    firstMonth,
                    1
                ) -
                (
                    5.5 *
                    60 *
                    60 *
                    1000
                )
            );


        /* ======================================================
           1. TOTAL ORDERS
        ====================================================== */

        const totalOrders =
            await Order.countDocuments({
                orderStatus: {
                    $ne: "CANCELLED"
                }
            });


        /* ======================================================
           2. TOTAL REVENUE
        ====================================================== */

        const totalRevenueResult =
            await Order.aggregate([
                {
                    $match: {
                        orderStatus: {
                            $ne: "CANCELLED"
                        }
                    }
                },

                {
                    $group: {
                        _id: null,

                        total: {
                            $sum:
                                "$pricing.total"
                        }
                    }
                }
            ]);


        const totalRevenue =
            totalRevenueResult.length > 0
                ? totalRevenueResult[0].total
                : 0;


        /* ======================================================
           3. AVERAGE ORDER VALUE
        ====================================================== */

        const averageOrderValue =
            totalOrders > 0
                ? roundNumber(
                    totalRevenue /
                    totalOrders,
                    2
                )
                : 0;


        /* ======================================================
           4. TOTAL CUSTOMERS
        ====================================================== */

        const totalCustomers =
            await User.countDocuments();


        /* ======================================================
           5. REPEAT CUSTOMERS
        ====================================================== */

        /*
         * A repeat customer is a customer who has
         * placed more than one non-cancelled order.
         */

        const repeatCustomerResult =
            await Order.aggregate([
                {
                    $match: {
                        orderStatus: {
                            $ne: "CANCELLED"
                        },

                        user: {
                            $ne: null
                        }
                    }
                },

                {
                    $group: {
                        _id: "$user",

                        orderCount: {
                            $sum: 1
                        }
                    }
                },

                {
                    $match: {
                        orderCount: {
                            $gt: 1
                        }
                    }
                },

                {
                    $count: "count"
                }
            ]);


        const repeatCustomers =
            repeatCustomerResult.length > 0
                ? repeatCustomerResult[0].count
                : 0;


        const repeatRate =
            totalCustomers > 0
                ? roundNumber(
                    (
                        repeatCustomers /
                        totalCustomers
                    ) *
                    100,
                    1
                )
                : 0;


        /* ======================================================
           6. TODAY'S ORDERS
        ====================================================== */

        const todayOrders =
            await Order.countDocuments({

                createdAt: {
                    $gte: startOfToday,
                    $lt: startOfTomorrow
                },

                orderStatus: {
                    $ne: "CANCELLED"
                }

            });


        /* ======================================================
           7. YESTERDAY'S ORDERS
        ====================================================== */

        const yesterdayOrders =
            await Order.countDocuments({

                createdAt: {
                    $gte: startOfYesterday,
                    $lt: startOfToday
                },

                orderStatus: {
                    $ne: "CANCELLED"
                }

            });


        /* ======================================================
           8. TODAY'S REVENUE
        ====================================================== */

        const todayRevenueResult =
            await Order.aggregate([
                {
                    $match: {

                        createdAt: {
                            $gte: startOfToday,
                            $lt: startOfTomorrow
                        },

                        orderStatus: {
                            $ne: "CANCELLED"
                        }

                    }
                },

                {
                    $group: {

                        _id: null,

                        total: {
                            $sum:
                                "$pricing.total"
                        }

                    }
                }
            ]);


        const todayRevenue =
            todayRevenueResult.length > 0
                ? todayRevenueResult[0].total
                : 0;


        /* ======================================================
           9. YESTERDAY'S REVENUE
        ====================================================== */

        const yesterdayRevenueResult =
            await Order.aggregate([
                {
                    $match: {

                        createdAt: {
                            $gte: startOfYesterday,
                            $lt: startOfToday
                        },

                        orderStatus: {
                            $ne: "CANCELLED"
                        }

                    }
                },

                {
                    $group: {

                        _id: null,

                        total: {
                            $sum:
                                "$pricing.total"
                        }

                    }
                }
            ]);


        const yesterdayRevenue =
            yesterdayRevenueResult.length > 0
                ? yesterdayRevenueResult[0].total
                : 0;


        /* ======================================================
           10. TODAY'S AOV
        ====================================================== */

        const todayAverageOrderValue =
            todayOrders > 0
                ? roundNumber(
                    todayRevenue /
                    todayOrders,
                    2
                )
                : 0;


        /* ======================================================
           11. YESTERDAY'S AOV
        ====================================================== */

        const yesterdayAverageOrderValue =
            yesterdayOrders > 0
                ? roundNumber(
                    yesterdayRevenue /
                    yesterdayOrders,
                    2
                )
                : 0;


        /* ======================================================
           12. MONTHLY REVENUE
        ====================================================== */

        const monthlyRevenueResult =
            await Order.aggregate([

                {
                    $match: {

                        createdAt: {
                            $gte:
                                sixMonthStart,

                            $lt:
                                startOfTomorrow
                        },

                        orderStatus: {
                            $ne:
                                "CANCELLED"
                        }

                    }
                },

                {
                    $group: {

                        _id: {

                            year: {
                                $year:
                                    "$createdAt"
                            },

                            month: {
                                $month:
                                    "$createdAt"
                            }

                        },

                        revenue: {

                            $sum:
                                "$pricing.total"

                        }

                    }
                },

                {
                    $sort: {

                        "_id.year": 1,

                        "_id.month": 1

                    }

                }

            ]);


        /*
         * Always return six months.
         * Months without orders return 0.
         */

        const monthlyRevenue = [];


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const monthDate =
                new Date(
                    Date.UTC(
                        firstMonthYear,
                        firstMonth + i,
                        1
                    )
                );


            const year =
                monthDate.getUTCFullYear();


            const month =
                monthDate.getUTCMonth() + 1;


            const matchingMonth =
                monthlyRevenueResult.find(
                    item =>
                        item._id.year === year &&
                        item._id.month === month
                );


            monthlyRevenue.push({

                label:
                    getMonthLabel(
                        year,
                        month
                    ),

                year,

                month,

                value:
                    matchingMonth
                        ? roundNumber(
                            matchingMonth.revenue,
                            2
                        )
                        : 0

            });

        }


        /* ======================================================
           13. PEAK ORDER HOURS
        ====================================================== */

        const hourlyResult =
            await Order.aggregate([

                {
                    $match: {

                        orderStatus: {
                            $ne:
                                "CANCELLED"
                        }

                    }
                },

                {
                    $project: {

                        hour: {
                            $hour:
                                "$createdAt"
                        }

                    }
                },

                {
                    $group: {

                        _id:
                            "$hour",

                        orders: {
                            $sum: 1
                        }

                    }
                },

                {
                    $sort: {
                        _id: 1
                    }

                }

            ]);


        const hourlyMap = {};


        hourlyResult.forEach(
            item => {

                hourlyMap[
                    item._id
                ] =
                    item.orders;

            }
        );


        /*
         * Return all 24 hours so frontend doesn't
         * have to guess missing hours.
         */

        const peakOrderHours = [];


        for (
            let hour = 0;
            hour < 24;
            hour++
        ) {

            peakOrderHours.push({

                hour,

                label:
                    formatHour(
                        hour
                    ),

                value:
                    hourlyMap[hour] || 0

            });

        }


        /* ======================================================
           14. CUSTOMER GROWTH
        ====================================================== */

        const customerGrowthResult =
            await User.aggregate([

                {
                    $match: {

                        createdAt: {
                            $gte:
                                sixMonthStart,

                            $lt:
                                startOfTomorrow
                        }

                    }
                },

                {
                    $group: {

                        _id: {

                            year: {
                                $year:
                                    "$createdAt"
                            },

                            month: {
                                $month:
                                    "$createdAt"
                            }

                        },

                        customers: {
                            $sum: 1
                        }

                    }
                },

                {
                    $sort: {

                        "_id.year": 1,

                        "_id.month": 1

                    }

                }

            ]);


        const customerGrowth = [];


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const monthDate =
                new Date(
                    Date.UTC(
                        firstMonthYear,
                        firstMonth + i,
                        1
                    )
                );


            const year =
                monthDate.getUTCFullYear();


            const month =
                monthDate.getUTCMonth() + 1;


            const matchingMonth =
                customerGrowthResult.find(
                    item =>
                        item._id.year === year &&
                        item._id.month === month
                );


            customerGrowth.push({

                label:
                    getMonthLabel(
                        year,
                        month
                    ),

                year,

                month,

                value:
                    matchingMonth
                        ? matchingMonth.customers
                        : 0

            });

        }


        /* ======================================================
           15. BEST SELLING PRODUCTS
        ====================================================== */

        const bestSellingProducts =
            await Order.aggregate([

                {
                    $match: {

                        orderStatus: {
                            $ne:
                                "CANCELLED"
                        }

                    }
                },

                {
                    $unwind:
                        "$items"
                },

                {
                    $group: {

                        _id:
                            "$items.productId",

                        name: {
                            $first:
                                "$items.name"
                        },

                        units: {

                            $sum:
                                "$items.quantity"

                        },

                        revenue: {

                            $sum: {

                                $multiply: [

                                    "$items.price",

                                    "$items.quantity"

                                ]

                            }

                        }

                    }

                },

                {
                    $sort: {

                        units: -1

                    }

                },

                {
                    $limit: 5

                }

            ]);


        const formattedBestSellingProducts =
            bestSellingProducts.map(
                product => ({

                    productId:
                        product._id,

                    name:
                        product.name,

                    units:
                        product.units,

                    revenue:
                        roundNumber(
                            product.revenue,
                            2
                        )

                })
            );


        /* ======================================================
           16. ORDER STATUS DISTRIBUTION
        ====================================================== */

        const orderStatusResult =
            await Order.aggregate([

                {
                    $group: {

                        _id:
                            "$orderStatus",

                        count: {
                            $sum: 1
                        }

                    }

                },

                {
                    $sort: {
                        count: -1
                    }

                }

            ]);


        const orderStatus =
            orderStatusResult.map(
                item => ({

                    status:
                        item._id,

                    count:
                        item.count

                })
            );


        /* ======================================================
           17. PAYMENT METHOD DISTRIBUTION
        ====================================================== */

        const paymentMethodResult =
            await Order.aggregate([

                {
                    $group: {

                        _id:
                            "$paymentMethod",

                        count: {
                            $sum: 1
                        },

                        revenue: {

                            $sum:
                                "$pricing.total"

                        }

                    }

                },

                {
                    $sort: {
                        count: -1
                    }

                }

            ]);


        const paymentMethods =
            paymentMethodResult.map(
                item => ({

                    method:
                        item._id,

                    count:
                        item.count,

                    revenue:
                        roundNumber(
                            item.revenue,
                            2
                        )

                })
            );


        /* ======================================================
           18. COUPON USAGE
        ====================================================== */

        const couponUsageResult =
            await Order.aggregate([

                {
                    $match: {

                        orderStatus: {
                            $ne:
                                "CANCELLED"
                        },

                        "coupon.code": {
                            $exists: true,

                            $ne: ""
                        }

                    }

                },

                {
                    $group: {

                        _id:
                            "$coupon.code",

                        usageCount: {
                            $sum: 1
                        },

                        discount: {

                            $sum:
                                "$coupon.discount"

                        }

                    }

                },

                {
                    $sort: {

                        usageCount: -1

                    }

                },

                {
                    $limit: 10

                }

            ]);


        const couponUsage =
            couponUsageResult.map(
                coupon => ({

                    code:
                        coupon._id,

                    usageCount:
                        coupon.usageCount,

                    discount:
                        roundNumber(
                            coupon.discount,
                            2
                        )

                })
            );


        /* ======================================================
           19. CHANGE CALCULATIONS
        ====================================================== */

        const revenueChange =
            getPercentageChange(
                todayRevenue,
                yesterdayRevenue
            );


        const ordersChange =
            getPercentageChange(
                todayOrders,
                yesterdayOrders
            );


        const aovChange =
            getPercentageChange(
                todayAverageOrderValue,
                yesterdayAverageOrderValue
            );


        /* ======================================================
           20. RESPONSE
        ====================================================== */

        return res.status(200).json({

            success: true,

            data: {

                /* ------------------------------------------
                   OVERVIEW
                ------------------------------------------ */

                overview: {

                    totalRevenue:
                        roundNumber(
                            totalRevenue,
                            2
                        ),

                    totalOrders,

                    averageOrderValue,

                    totalCustomers,

                    repeatCustomers,

                    repeatRate

                },


                /* ------------------------------------------
                   TODAY
                ------------------------------------------ */

                today: {

                    revenue:
                        roundNumber(
                            todayRevenue,
                            2
                        ),

                    orders:
                        todayOrders,

                    averageOrderValue:
                        todayAverageOrderValue,

                    changes: {

                        revenue:
                            formatPercentageChange(
                                revenueChange
                            ),

                        orders:
                            formatPercentageChange(
                                ordersChange
                            ),

                        averageOrderValue:
                            formatPercentageChange(
                                aovChange
                            )

                    }

                },


                /* ------------------------------------------
                   MONTHLY REVENUE
                ------------------------------------------ */

                monthlyRevenue,


                /* ------------------------------------------
                   PEAK HOURS
                ------------------------------------------ */

                peakOrderHours,


                /* ------------------------------------------
                   CUSTOMER GROWTH
                ------------------------------------------ */

                customerGrowth,


                /* ------------------------------------------
                   BEST SELLING PRODUCTS
                ------------------------------------------ */

                bestSellingProducts:
                    formattedBestSellingProducts,


                /* ------------------------------------------
                   ORDER STATUS
                ------------------------------------------ */

                orderStatus,


                /* ------------------------------------------
                   PAYMENT METHODS
                ------------------------------------------ */

                paymentMethods,


                /* ------------------------------------------
                   COUPON USAGE
                ------------------------------------------ */

                couponUsage,


                /* ------------------------------------------
                   CATEGORY ANALYTICS
                ------------------------------------------ */

                categories: null

            }

        });

    } catch (error) {

        console.error(
            "Analytics Controller Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load analytics data."

        });

    }

};