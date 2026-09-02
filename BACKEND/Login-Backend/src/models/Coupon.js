const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({

    /* =====================================================
       COUPON CODE
    ====================================================== */

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },


    /* =====================================================
       DISPLAY INFORMATION
    ====================================================== */

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },


    /* =====================================================
       ORDER CONDITION
    ====================================================== */

    minOrder: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },


    /* =====================================================
       DISCOUNT
    ====================================================== */

    discountType: {
        type: String,
        enum: ["flat", "percentage"],
        default: "flat",
        required: true
    },

    discountValue: {
        type: Number,
        required: true,
        min: 0
    },


    /* =====================================================
       COUPON VISIBILITY
    ====================================================== */

    couponType: {
        type: String,
        enum: ["public", "private"],
        default: "public",
        required: true
    },

    showOnSite: {
        type: Boolean,
        default: true
    },


    /* =====================================================
       USAGE
    ====================================================== */

    usageLimit: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },

    perCustomerLimit: {
        type: Number,
        default: 1,
        min: 1
    },


    /* =====================================================
       STATUS
    ====================================================== */

    isActive: {
        type: Boolean,
        default: true
    },


    /* =====================================================
       EXPIRY
    ====================================================== */

    expiry: {
        type: Date
    }

}, {
    timestamps: true
});


module.exports =
    mongoose.model("Coupon", couponSchema);