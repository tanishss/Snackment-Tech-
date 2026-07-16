const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

    productId: String,

    name: String,

    image: String,

    price: Number,

    qty: Number

});

const orderSchema = new mongoose.Schema({

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    items: [orderItemSchema],

    address: {

        hostel: String,

        room: String,

        address: String

    },

    coupon: {

        code: String,

        discount: Number

    },

    subtotal: {

        type: Number,

        required: true

    },

    deliveryFee: {

        type: Number,

        required: true

    },

    total: {

        type: Number,

        required: true

    },

    deliveryType: {

        type: String,

        enum: ["pickup", "room"],

        default: "pickup"

    },
    paymentMethod: {

        type: String,

        default: "Scan on Delivery"

    },

    paymentStatus: {

        type: String,

        enum: [
            "Pending",
            "Paid",
            "Failed"
        ],

        default: "Pending"

    },

    orderStatus: {

        type: String,

        enum: [

            "Placed",

            "Preparing",

            "Out for Delivery",

            "Delivered",

            "Cancelled"

        ],

        default: "Placed"

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "Order",
    orderSchema
);

