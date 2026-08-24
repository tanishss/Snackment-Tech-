const Order = require("../models/Order");

/* ==========================================================
   Helpers
========================================================== */

function getIndiaDayStart(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const year = Number(parts.find((p) => p.type === "year").value);
    const month = Number(parts.find((p) => p.type === "month").value);
    const day = Number(parts.find((p) => p.type === "day").value);

    return new Date(
        Date.UTC(year, month - 1, day) - (5.5 * 60 * 60 * 1000)
    );
}

function getPercentageChange(current, previous) {
    if (previous === 0) {
        if (current === 0) {
            return 0;
        }

        return null;
    }

    return Number(
        (((current - previous) / previous) * 100).toFixed(1)
    );
}

function formatChange(value) {
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
   Dashboard Controller
========================================================== */

exports.getDashboard = async (req, res) => {
    try {
        /* ======================================================
           India Date Setup
        ====================================================== */

        const startOfToday = getIndiaDayStart();

        const startOfTomorrow = new Date(
            startOfToday.getTime() + 24 * 60 * 60 * 1000
        );

        const startOfYesterday = new Date(
            startOfToday.getTime() - 24 * 60 * 60 * 1000
        );

        /* ======================================================
           Week Setup
        ====================================================== */

        const indiaDateFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "short"
        });

        const todayWeekday =
            indiaDateFormatter.format(new Date());

        const weekdayMap = {
            Mon: 0,
            Tue: 1,
            Wed: 2,
            Thu: 3,
            Fri: 4,
            Sat: 5,
            Sun: 6
        };

        const daysFromMonday =
            weekdayMap[todayWeekday];

        const startOfWeek = new Date(
            startOfToday.getTime() -
            daysFromMonday * 24 * 60 * 60 * 1000
        );

        /* ======================================================
           Today's Orders
        ====================================================== */

        const todayOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            }
        });

        /* ======================================================
           Yesterday's Orders
        ====================================================== */

        const yesterdayOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfYesterday,
                $lt: startOfToday
            }
        });

        /* ======================================================
           Current Order Status Counts
        ====================================================== */

        const [
            pendingOrders,
            preparingOrders,
            readyOrders,
            deliveredOrders
        ] = await Promise.all([
            Order.countDocuments({
                orderStatus: "PENDING"
            }),

            Order.countDocuments({
                orderStatus: "PACKING"
            }),

            Order.countDocuments({
                orderStatus: "READY_FOR_PICKUP"
            }),

            Order.countDocuments({
                orderStatus: "DELIVERED",
                createdAt: {
                    $gte: startOfToday,
                    $lt: startOfTomorrow
                }
            })
        ]);

        /* ======================================================
           Yesterday Delivered Orders
        ====================================================== */

        const yesterdayDeliveredOrders =
            await Order.countDocuments({
                orderStatus: "DELIVERED",
                createdAt: {
                    $gte: startOfYesterday,
                    $lt: startOfToday
                }
            });

        /* ======================================================
           Revenue Today
        ====================================================== */

        const todayRevenueResult = await Order.aggregate([
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
                        $sum: "$pricing.total"
                    }
                }
            }
        ]);

        const revenueToday =
            todayRevenueResult.length > 0
                ? todayRevenueResult[0].total
                : 0;

        /* ======================================================
           Revenue Yesterday
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
                            $sum: "$pricing.total"
                        }
                    }
                }
            ]);

        const revenueYesterday =
            yesterdayRevenueResult.length > 0
                ? yesterdayRevenueResult[0].total
                : 0;

        /* ======================================================
           Active Customers Today
        ====================================================== */

        const todayCustomersResult =
            await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfToday,
                            $lt: startOfTomorrow
                        },
                        user: {
                            $ne: null
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user"
                    }
                },
                {
                    $count: "count"
                }
            ]);

        const activeCustomers =
            todayCustomersResult.length > 0
                ? todayCustomersResult[0].count
                : 0;

        /* ======================================================
           Active Customers Yesterday
        ====================================================== */

        const yesterdayCustomersResult =
            await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYesterday,
                            $lt: startOfToday
                        },
                        user: {
                            $ne: null
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user"
                    }
                },
                {
                    $count: "count"
                }
            ]);

        const activeCustomersYesterday =
            yesterdayCustomersResult.length > 0
                ? yesterdayCustomersResult[0].count
                : 0;

        /* ======================================================
           Weekly Revenue
        ====================================================== */

        const weeklyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfWeek,
                        $lt: startOfTomorrow
                    },
                    orderStatus: {
                        $ne: "CANCELLED"
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dayOfWeek: "$createdAt"
                    },
                    revenue: {
                        $sum: "$pricing.total"
                    }
                }
            }
        ]);

        /* ======================================================
           Format Weekly Revenue
        ====================================================== */

        const revenueByDay = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        };

        weeklyRevenue.forEach((item) => {
            const revenue = item.revenue || 0;

            switch (item._id) {
                case 1:
                    revenueByDay.Sunday = revenue;
                    break;

                case 2:
                    revenueByDay.Monday = revenue;
                    break;

                case 3:
                    revenueByDay.Tuesday = revenue;
                    break;

                case 4:
                    revenueByDay.Wednesday = revenue;
                    break;

                case 5:
                    revenueByDay.Thursday = revenue;
                    break;

                case 6:
                    revenueByDay.Friday = revenue;
                    break;

                case 7:
                    revenueByDay.Saturday = revenue;
                    break;
            }
        });

        /* ======================================================
           Orders By Hour
        ====================================================== */

        const hourlyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfToday,
                        $lt: startOfTomorrow
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $hour: "$createdAt"
                    },
                    orders: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id": 1
                }
            }
        ]);

        /* ======================================================
           Format Hourly Data
        ====================================================== */

        const hourlyMap = {};

        hourlyOrders.forEach((item) => {
            hourlyMap[item._id] = item.orders;
        });

        const hourlySlots = [
            8,
            10,
            12,
            14,
            16,
            18,
            20,
            22
        ];

        const formattedHourlyOrders =
            hourlySlots.map((hour) => {
                let label;

                if (hour < 12) {
                    label = `${hour}am`;
                } else if (hour === 12) {
                    label = "12pm";
                } else {
                    label = `${hour - 12}pm`;
                }

                return {
                    time: label,
                    hour,
                    value: hourlyMap[hour] || 0
                };
            });

        /* ======================================================
           Top Selling Products
        ====================================================== */

        const topProducts = await Order.aggregate([
            {
                $match: {
                    orderStatus: {
                        $ne: "CANCELLED"
                    }
                }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: "$items.productId",
                    name: {
                        $first: "$items.name"
                    },
                    quantity: {
                        $sum: "$items.quantity"
                    }
                }
            },
            {
                $sort: {
                    quantity: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        /* ======================================================
           Recent Orders
        ====================================================== */

        const recentOrders = await Order.find()
            .sort({
                createdAt: -1
            })
            .limit(6)
            .populate(
                "user",
                "name phone"
            )
            .lean();

        /* ======================================================
           Format Recent Orders
        ====================================================== */

        const formattedRecentOrders =
            recentOrders.map((order) => {
                return {
                    orderId: order.orderId,

                    customer: order.user
                        ? order.user.name
                        : "Unknown Customer",

                    items: order.items.length,

                    total: order.pricing.total,

                    payment:
                        order.paymentMethod === "upi"
                            ? "UPI"
                            : "Scan on Delivery",

                    status: order.orderStatus,

                    createdAt: order.createdAt
                };
            });

        /* ======================================================
           Percentage Changes
        ====================================================== */

        const changes = {
            todayOrders: getPercentageChange(
                todayOrders,
                yesterdayOrders
            ),

            deliveredOrders: getPercentageChange(
                deliveredOrders,
                yesterdayDeliveredOrders
            ),

            revenueToday: getPercentageChange(
                revenueToday,
                revenueYesterday
            ),

            activeCustomers: getPercentageChange(
                activeCustomers,
                activeCustomersYesterday
            ),

            /*
             * These require historical snapshots/status history.
             * We will connect them separately.
             */
            pendingOrders: null,
            preparingOrders: null,
            readyOrders: null,
            productsInStock: null
        };

        /* ======================================================
           Dashboard Response
        ====================================================== */

        return res.status(200).json({
            success: true,

            stats: {
                todayOrders,
                pendingOrders,
                preparingOrders,
                readyOrders,
                deliveredOrders,
                revenueToday,
                activeCustomers,

                /*
                 * Product stock will be connected
                 * after Product schema integration.
                 */
                productsInStock: null
            },

            changes: {
                todayOrders: formatChange(
                    changes.todayOrders
                ),

                pendingOrders: formatChange(
                    changes.pendingOrders
                ),

                preparingOrders: formatChange(
                    changes.preparingOrders
                ),

                readyOrders: formatChange(
                    changes.readyOrders
                ),

                deliveredOrders: formatChange(
                    changes.deliveredOrders
                ),

                revenueToday: formatChange(
                    changes.revenueToday
                ),

                activeCustomers: formatChange(
                    changes.activeCustomers
                ),

                productsInStock: formatChange(
                    changes.productsInStock
                )
            },

            revenueChart: [
                {
                    day: "Mon",
                    value: revenueByDay.Monday
                },
                {
                    day: "Tue",
                    value: revenueByDay.Tuesday
                },
                {
                    day: "Wed",
                    value: revenueByDay.Wednesday
                },
                {
                    day: "Thu",
                    value: revenueByDay.Thursday
                },
                {
                    day: "Fri",
                    value: revenueByDay.Friday
                },
                {
                    day: "Sat",
                    value: revenueByDay.Saturday
                },
                {
                    day: "Sun",
                    value: revenueByDay.Sunday
                }
            ],

            hourlyOrders: formattedHourlyOrders,

            topProducts,

            recentOrders: formattedRecentOrders
        });

    } catch (error) {
        console.error(
            "Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load dashboard data."
        });
    }
};