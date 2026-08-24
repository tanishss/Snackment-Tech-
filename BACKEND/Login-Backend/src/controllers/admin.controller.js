const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");


/* ==========================================================
   Twilio Configuration
========================================================== */

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const verifyServiceSid =
    process.env.TWILIO_VERIFY_SERVICE_SID;


/* ==========================================================
   Send Admin OTP
========================================================== */

const sendAdminOTP = async (req, res) => {

    try {

        const { phone } = req.body;


        /* --------------------------------------------------
           Check Phone Number
        -------------------------------------------------- */

        if (!phone) {

            return res.status(400).json({

                success: false,

                message: "Phone number is required."

            });

        }


        /* --------------------------------------------------
           Clean Phone Number
        -------------------------------------------------- */

        const cleanPhone =
            String(phone)
                .replace(/\D/g, "");


        /* --------------------------------------------------
           Validate Phone Number
        -------------------------------------------------- */

        if (cleanPhone.length !== 10) {

            return res.status(400).json({

                success: false,

                message: "Please enter a valid 10-digit phone number."

            });

        }


        /* --------------------------------------------------
           Find Admin
        -------------------------------------------------- */

        const admin = await Admin.findOne({

            phone: cleanPhone,

            isActive: true

        });


        /* --------------------------------------------------
           Check Admin Authorization
        -------------------------------------------------- */

        if (!admin) {

            return res.status(403).json({

                success: false,

                message:
                    "This phone number isn't registered as an administrator."

            });

        }


        /* --------------------------------------------------
           Convert To E.164 Format
           India = +91
        -------------------------------------------------- */

        const twilioPhone =
            `+91${cleanPhone}`;


        /* --------------------------------------------------
           Send OTP Through Twilio Verify
        -------------------------------------------------- */

        const verification =
            await twilioClient
                .verify
                .v2
                .services(verifyServiceSid)
                .verifications
                .create({

                    to: twilioPhone,

                    channel: "sms"

                });


        /* --------------------------------------------------
           Success Response
        -------------------------------------------------- */

        return res.status(200).json({

            success: true,

            message: "OTP sent successfully.",

            status: verification.status

        });

    } catch (error) {

        console.error(
            "Admin OTP Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send OTP. Please try again."

        });

    }

};


/* ==========================================================
   Verify Admin OTP
========================================================== */

const verifyAdminOTP = async (req, res) => {

    try {

        const { phone, otp } = req.body;


        /* --------------------------------------------------
           Check Required Fields
        -------------------------------------------------- */

        if (!phone || !otp) {

            return res.status(400).json({

                success: false,

                message: "Phone number and OTP are required."

            });

        }


        /* --------------------------------------------------
           Clean Phone Number
        -------------------------------------------------- */

        const cleanPhone =
            String(phone)
                .replace(/\D/g, "");


        /* --------------------------------------------------
           Validate Phone Number
        -------------------------------------------------- */

        if (cleanPhone.length !== 10) {

            return res.status(400).json({

                success: false,

                message: "Please enter a valid 10-digit phone number."

            });

        }


        /* --------------------------------------------------
           Validate OTP Format
        -------------------------------------------------- */

        const cleanOTP =
            String(otp)
                .replace(/\D/g, "");


        if (cleanOTP.length !== 6) {

            return res.status(400).json({

                success: false,

                message: "Please enter a valid 6-digit OTP."

            });

        }


        /* --------------------------------------------------
           Check Admin
        -------------------------------------------------- */

        const admin = await Admin.findOne({

            phone: cleanPhone,

            isActive: true

        });


        /* --------------------------------------------------
           Check Admin Authorization
        -------------------------------------------------- */

        if (!admin) {

            return res.status(403).json({

                success: false,

                message:
                    "This phone number isn't registered as an administrator."

            });

        }


        /* --------------------------------------------------
           Convert To E.164 Format
           India = +91
        -------------------------------------------------- */

        const twilioPhone =
            `+91${cleanPhone}`;


        /* --------------------------------------------------
           Verify OTP Through Twilio
        -------------------------------------------------- */

        const verificationCheck =
            await twilioClient
                .verify
                .v2
                .services(verifyServiceSid)
                .verificationChecks
                .create({

                    to: twilioPhone,

                    code: cleanOTP

                });


        /* --------------------------------------------------
           Check Verification Status
        -------------------------------------------------- */

        if (verificationCheck.status !== "approved") {

            return res.status(401).json({

                success: false,

                message: "Invalid or expired OTP."

            });

        }


        /* --------------------------------------------------
           Generate Admin JWT
        -------------------------------------------------- */

        const token = jwt.sign(
            {
                adminId: admin._id,
                phone: admin.phone,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );


        /* --------------------------------------------------
           Successful Admin Login
        -------------------------------------------------- */

        return res.status(200).json({

            success: true,

            message: "Admin login successful.",

            token,

            admin: {

                id: admin._id,

                name: admin.name,

                phone: admin.phone,

                role: admin.role

            }

        });

    } catch (error) {

        console.error(
            "Admin OTP Verification Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify OTP. Please try again."

        });

    }

};


/* ==========================================================
   Get Admin Profile
========================================================== */

const getAdminProfile = async (req, res) => {

    try {

        /* --------------------------------------------------
           Get Admin ID From JWT
        -------------------------------------------------- */

        const adminId =
            req.admin.adminId;


        /* --------------------------------------------------
           Find Admin
        -------------------------------------------------- */

        const admin = await Admin.findOne({

            _id: adminId,

            isActive: true

        }).select("-__v");


        /* --------------------------------------------------
           Check Admin
        -------------------------------------------------- */

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin account not found."

            });

        }


        /* --------------------------------------------------
           Return Admin Profile
        -------------------------------------------------- */

        return res.status(200).json({

            success: true,

            admin: {

                id: admin._id,

                name: admin.name,

                phone: admin.phone,

                role: admin.role,

                isActive: admin.isActive

            }

        });

    } catch (error) {

        console.error(
            "Get Admin Profile Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: "Unable to fetch admin profile."

        });

    }

};


/* ==========================================================
   Export Controller
========================================================== */

module.exports = {

    sendAdminOTP,

    verifyAdminOTP,

    getAdminProfile

};