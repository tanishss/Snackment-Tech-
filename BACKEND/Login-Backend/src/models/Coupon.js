const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    minOrder: {
        type: Number,
        required: true
    },

    discountType: {
        type: String,
        enum: ["flat", "percentage"],
        default: "flat"
    },

    discountValue: {
        type: Number,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    expiry: {
        type: Date
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Coupon", couponSchema);