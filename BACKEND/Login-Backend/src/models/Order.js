const mongoose = require("mongoose");

// ==========================================================
// ORDER ITEM SCHEMA
// ==========================================================

const orderItemSchema = new mongoose.Schema(

    {

        productId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            default: "",
        },

        price: {
            type: Number,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

    },

    { _id: false }

);

// ==========================================================
// ORDER SCHEMA
// ==========================================================

const orderSchema = new mongoose.Schema(

    {

        orderId: {
            type: String,
            unique: true,
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: [
                (items) => items.length > 0,
                "Order must contain at least one item",
            ],
        },

        pricing: {

            subtotal: {
                type: Number,
                required: true,
            },

            discount: {
                type: Number,
                default: 0,
            },

            deliveryFee: {
                type: Number,
                required: true,
            },

            total: {
                type: Number,
                required: true,
            },

        },

        coupon: {

            code: {
                type: String,
                default: "",
            },

            discount: {
                type: Number,
                default: 0,
            },

        },

        deliveryMethod: {
            type: String,
            enum: [
                "pickup",
                "room"
            ],
            required: true,
        },

        address: {

            hostel: {
                type: String,
                required: true,
            },

            room: {
                type: String,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },

        },

        paymentMethod: {
            type: String,
            enum: [
                "scan_on_delivery",
                "upi"
            ],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed"
            ],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "PENDING",
                "PACKING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

    },

    {

        timestamps: true,

    }

);

module.exports = mongoose.model("Order", orderSchema);