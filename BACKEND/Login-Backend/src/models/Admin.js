const mongoose = require("mongoose");


/* ===========Admin Schema=========== */

const adminSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        default: "admin",
        enum: ["admin"]
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

/* ===========Export Model=========== */
module.exports = mongoose.model("Admin", adminSchema);