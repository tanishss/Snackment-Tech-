const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const orderController = require("../controllers/order.controller");

// ==========================================================
// ORDER PREVIEW
// ==========================================================

router.get(
    "/preview",
    authMiddleware,
    orderController.getOrderPreview
);

// ==========================================================
// ACTIVE ORDER
// ==========================================================

router.get(
    "/active",
    authMiddleware,
    orderController.getActiveOrder
);

// ==========================================================
// ORDER HISTORY
// ==========================================================

router.get(
    "/",
    authMiddleware,
    orderController.getOrders
);

// ==========================================================
// SINGLE ORDER
// ==========================================================

router.get(
    "/:orderId",
    authMiddleware,
    orderController.getOrderById
);

// ==========================================================
// CREATE ORDER
// ==========================================================

router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

module.exports = router;