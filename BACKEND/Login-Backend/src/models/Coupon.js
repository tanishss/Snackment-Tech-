const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

    /* ==========================================================
       BASIC COUPON INFORMATION
    ========================================================== */

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

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


    /* ==========================================================
       DISCOUNT
    ========================================================== */

    minOrder: {
        type: Number,
        required: true,
        min: 0
    },

    discountType: {
        type: String,
        enum: [
            "flat",
            "percentage"
        ],
        default: "flat"
    },

    discountValue: {
        type: Number,
        required: true,
        min: 0
    },


    /* ==========================================================
       STATUS
    ========================================================== */

    isActive: {
        type: Boolean,
        default: true
    },

    showOnSite: {
        type: Boolean,
        default: true
    },


    /* ==========================================================
       EXPIRY
    ========================================================== */

    expiry: {
        type: Date,
        default: null
    },


    /* ==========================================================
       COUPON TYPE
       ----------------------------------------------------------
       public
           → visible on website

       user_specific
           → hidden from website and assigned to
             selected users
    ========================================================== */

    couponType: {
    type: String,
    enum: [
        "public",
        "private"
    ],
    default: "public"
},


    /* ==========================================================
       USAGE LIMIT
    ========================================================== */

    usageLimit: {
        type: Number,
        default: null,
        min: 1
    },

    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },


    /* ==========================================================
       PER CUSTOMER LIMIT
       ----------------------------------------------------------
       Example:

       perCustomerLimit: 1

       means one customer can use this coupon only once.
    ========================================================== */

    perCustomerLimit: {
        type: Number,
        default: null,
        min: 1
    },


    /* ==========================================================
       USER-SPECIFIC ASSIGNMENT
       ----------------------------------------------------------
       Only used when couponType = user_specific.
    ========================================================== */

    assignedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

}, {

    timestamps: true

});


module.exports =
    mongoose.model(
        "Coupon",
        couponSchema
    );