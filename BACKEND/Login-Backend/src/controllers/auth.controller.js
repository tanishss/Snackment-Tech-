console.log("AUTH CONTROLLER LOADED");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");


exports.checkPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: "Phone number is required."
            });
        }

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit phone number."
            });
        }

        const user = await User.findOne({ phone });

        return res.status(200).json({
            exists: !!user
        });

    } catch (err) {
        console.error("Check Phone Error:", err);

        return res.status(500).json({
            message: "Server error."
        });
    }
};

exports.register = async (req, res) => {
    try {

        const {
            phone,
            name,
            email,
            password,
            hostel,
            room,
            address
        } = req.body;
        if (
            !phone ||
            !name ||
            !email ||
            !password ||
            !hostel ||
            !room ||
            !address
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }
        const existingPhone = await User.findOne({ phone });

        if (existingPhone) {
            return res.status(409).json({
                message: "Phone number already registered."
            });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            phone,
            name,
            email,
            password: hashedPassword,
            hostel,
            room,
            address,
            isProfileComplete: true
        });
        const token = jwt.sign(
            {
                userId: user._id,
                phone: user.phone
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                hostel: user.hostel,
                room: user.room,
                address: user.address,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};


exports.login = async (req, res) => {
    try {

        const {
            phone,
            password
        } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                message: "Phone number and password are required."
            });
        }
        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(401).json({
                message: "Invalid phone number or password."
            });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid phone number or password."
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                phone: user.phone
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                hostel: user.hostel,
                room: user.room,
                address: user.address,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};