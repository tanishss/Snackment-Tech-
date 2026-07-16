const express = require("express");
const router = express.Router();

const Address = require("../models/Address");
const auth = require("../middlewares/auth.middleware");

// ===============================
// Add New Address
// POST /api/address
// ===============================

router.post("/", auth, async (req, res) => {

    try {

        const { hostel, room, address } = req.body;

        const newAddress = await Address.create({

            user: req.userId,
            hostel,
            room,
            address

        });

        res.status(201).json(newAddress);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to save address"
        });

    }

});


// ===============================
// Get Saved Addresses
// GET /api/address
// ===============================

router.get("/", auth, async (req, res) => {

    try {

        const addresses = await Address.find({

            user: req.userId

        }).sort({

            createdAt: -1

        });

        res.json(addresses);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to fetch addresses"
        });

    }

});

module.exports = router;