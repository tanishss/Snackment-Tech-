const generateOrderId = require("../utils/generateOrderId");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

exports.createOrder = async (req, res) => {
    try {

        const {
            deliveryMethod,
            coupon,
            address,
            paymentMethod
        } = req.body;

        // -----------------------------
        // Get User Cart
        // -----------------------------
        const cart = await Cart.findOne({
            userId: req.userId
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // -----------------------------
        // Calculate Subtotal
        // -----------------------------
        const items = cart.items.map(item => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.qty
        }));

        const subtotal = items.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );

        // -----------------------------
        // Coupon Verification
        // -----------------------------
        let discount = 0;

        if (coupon?.code) {

            const dbCoupon = await Coupon.findOne({
                code: coupon.code.toUpperCase(),
                isActive: true
            });

            if (!dbCoupon) {
                return res.status(400).json({
                    message: "Invalid coupon"
                });
            }

            if (subtotal < dbCoupon.minOrder) {
                return res.status(400).json({
                    message: "Minimum order not reached"
                });
            }

            if (
                dbCoupon.expiry &&
                dbCoupon.expiry < new Date()
            ) {
                return res.status(400).json({
                    message: "Coupon expired"
                });
            }

            if (dbCoupon.discountType === "flat") {

                discount = dbCoupon.discountValue;

            } else {

                discount =
                    Math.floor(
                        subtotal *
                        dbCoupon.discountValue /
                        100
                    );

            }

        }

        // -----------------------------
        // Delivery Charge
        // -----------------------------
        let deliveryFee = 0;

        if (deliveryMethod === "room") {

            deliveryFee =
                subtotal >= 199 ? 0 : 10;

        }

        // -----------------------------
        // Final Total
        // -----------------------------
        const total =
            Math.max(
                subtotal - discount + deliveryFee,
                0
            );

        // -----------------------------
        // Generate Order ID
        // -----------------------------
        const orderId = await generateOrderId();
        // -----------------------------
        // Save Order
        // -----------------------------
        const order = await Order.create({

            orderId,

            user: req.userId,

            items,

            pricing: {

                subtotal,

                discount,

                deliveryFee,

                total

            },

            coupon: coupon?.code
                ? {
                    code: coupon.code,
                    discount
                }
                : undefined,

            deliveryMethod,

            address,

            paymentMethod,

            paymentStatus: "pending",

            orderStatus: "PACKING",
        });
        console.log("Saved Status:", order.orderStatus);

        // -----------------------------
        // Clear Cart
        // -----------------------------
        cart.items = [];

        await cart.save();

        // -----------------------------
        // Response
        // -----------------------------
        res.status(201).json({

            success: true,

            message: "Order placed successfully",

            order

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to create order"
        });

    }
};

exports.getOrderPreview = async (req, res) => {

    try {

        const {
            deliveryMethod = "pickup",
            coupon
        } = req.query;

        // -----------------------------
        // Get User Cart
        // -----------------------------
        const cart = await Cart.findOne({
            userId: req.userId
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // -----------------------------
        // Calculate Subtotal
        // -----------------------------
        const subtotal = cart.items.reduce(
            (sum, item) =>
                sum + item.price * item.qty,
            0
        );

        // -----------------------------
        // Coupon Verification
        // -----------------------------
        let discount = 0;

        if (coupon) {

            const dbCoupon = await Coupon.findOne({
                code: coupon.toUpperCase(),
                isActive: true
            });

            if (
                dbCoupon &&
                subtotal >= dbCoupon.minOrder &&
                (
                    !dbCoupon.expiry ||
                    dbCoupon.expiry > new Date()
                )
            ) {

                if (dbCoupon.discountType === "flat") {

                    discount = dbCoupon.discountValue;

                } else {

                    discount = Math.floor(
                        subtotal *
                        dbCoupon.discountValue /
                        100
                    );

                }

            }

        }

        // -----------------------------
        // Delivery Fee
        // -----------------------------
        let deliveryFee = 0;

        if (deliveryMethod === "room") {

            deliveryFee =
                subtotal >= 199
                    ? 0
                    : 10;

        }

        // -----------------------------
        // Total
        // -----------------------------
        const total = Math.max(
            subtotal -
            discount +
            deliveryFee,
            0
        );

        // -----------------------------
        // Response
        // -----------------------------
        res.json({

            success: true,

            itemCount: cart.items.length,

            pricing: {

                subtotal,

                discount,

                deliveryFee,

                total

            }

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to load preview"
        });

    }

};

exports.getActiveOrder = async (req, res) => {
    try {

        const order = await Order.findOne({
            user: req.userId,
            orderStatus: {
                $nin: ["DELIVERED", "CANCELLED"]
            }
        }).sort({ createdAt: -1 });

        if (!order) {
            return res.json({
                success: true,
                order: null
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to fetch active order"
        });

    }
};