const express = require("express");

const router = express.Router();

const adminAuth =
    require("../middlewares/admin.middleware");

const productController =
    require("../controllers/product.controller");


/* ==========================================================
   GET ALL PRODUCTS
========================================================== */

router.get(
    "/",
    adminAuth,
    productController.getProducts
);


/* ==========================================================
   GET SINGLE PRODUCT
========================================================== */

router.get(
    "/:productId",
    adminAuth,
    productController.getProductById
);


/* ==========================================================
   CREATE PRODUCT
========================================================== */

router.post(
    "/",
    adminAuth,
    productController.createProduct
);


/* ==========================================================
   UPDATE PRODUCT
========================================================== */

router.put(
    "/:productId",
    adminAuth,
    productController.updateProduct
);


/* ==========================================================
   DELETE PRODUCT
========================================================== */

router.delete(
    "/:productId",
    adminAuth,
    productController.deleteProduct
);


module.exports = router;