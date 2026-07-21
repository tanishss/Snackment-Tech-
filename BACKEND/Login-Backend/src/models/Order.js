const mongoose = require("mongoose");

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
            validate: [(v) => v.length > 0, "Order must contain at least one item"],
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
            code: String,
            discount: Number,
        },

        deliveryMethod: {
            type: String,
            enum: ["pickup", "room"],
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
            enum: ["scan_on_delivery", "upi"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending",
        },

        orderStatus: {
            type: String,

            enum: [
                "PACKING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PACKING",
        },

        estimatedReadyTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);