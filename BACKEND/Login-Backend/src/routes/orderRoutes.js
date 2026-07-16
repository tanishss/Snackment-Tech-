const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const calculateBill = require("../utils/billCalculator");
router.post("/", auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.userId
        });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const subtotal = cart.items.reduce(
            (sum, item) =>
                sum + item.price * item.qty,
            0
        );
        const {
            couponCode,
            deliveryType = "pickup"
        } = req.body;
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                isActive: true
            });
        }
        const bill = calculateBill(
            subtotal,
            coupon,
            deliveryType
        );
        const order = await Order.create({
            user: req.userId,
            items: cart.items,
            address: {
                hostel: user.hostel,
                room: user.room,
                address: user.address
            },
            deliveryType,
            coupon: coupon
                ? {
                    code: coupon.code,
                    discount: bill.discount
                }
                : null,
            subtotal: bill.subtotal,
            deliveryFee: bill.delivery,
            total: bill.total,
            paymentMethod: "Scan on Delivery",
            paymentStatus: "Pending",
            orderStatus: "PLACED"
        });
        await Cart.findOneAndDelete({
            userId: req.userId
        });
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Order Failed"
        });
    }
});

module.exports = router;