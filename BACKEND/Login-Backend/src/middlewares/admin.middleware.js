const jwt = require("jsonwebtoken");


/* ==========================================================
   Admin Authentication Middleware
========================================================== */

const adminAuth = (req, res, next) => {

    try {

        /* --------------------------------------------------
           Get Authorization Header
        -------------------------------------------------- */

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authorization token is required."

            });

        }


        /* --------------------------------------------------
           Check Bearer Token
        -------------------------------------------------- */

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format."

            });

        }


        /* --------------------------------------------------
           Extract Token
        -------------------------------------------------- */

        const token =
            authHeader.split(" ")[1];


        /* --------------------------------------------------
           Verify JWT
        -------------------------------------------------- */

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        /* --------------------------------------------------
           Check Admin Role
        -------------------------------------------------- */

        if (decoded.role !== "admin") {

            return res.status(403).json({

                success: false,

                message: "Admin access required."

            });

        }


        /* --------------------------------------------------
           Attach Admin Data To Request
        -------------------------------------------------- */

        req.admin = decoded;


        /* --------------------------------------------------
           Continue
        -------------------------------------------------- */

        next();

    } catch (error) {

        console.error(
            "Admin Authentication Error:",
            error.message
        );


        /* --------------------------------------------------
           Invalid / Expired Token
        -------------------------------------------------- */

        return res.status(401).json({

            success: false,

            message: "Invalid or expired admin token."

        });

    }

};


/* ==========================================================
   Export Middleware
========================================================== */

module.exports = adminAuth;