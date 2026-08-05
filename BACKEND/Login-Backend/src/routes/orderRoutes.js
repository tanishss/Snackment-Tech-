const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const orderController = require("../controllers/order.controller");

router.get(
    "/preview",
    authMiddleware,
    orderController.getOrderPreview
);
router.get(
    "/active",
    authMiddleware,
    orderController.getActiveOrder
);
router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

module.exports = router;