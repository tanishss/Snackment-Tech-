const Product = require("../models/Product");


/* ==========================================================
   GET ALL PRODUCTS
========================================================== */

exports.getProducts = async (req, res) => {

    try {

        const products =
            await Product.find()
                .sort({ createdAt: -1 });

        res.json({
            success: true,
            products
        });

    } catch (error) {

        console.error(
            "Get Products Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch products."
        });

    }

};


/* ==========================================================
   GET SINGLE PRODUCT
========================================================== */

exports.getProductById = async (req, res) => {

    try {

        const product =
            await Product.findOne({
                productId: req.params.productId
            });

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        res.json({
            success: true,
            product
        });

    } catch (error) {

        console.error(
            "Get Product Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch product."
        });

    }

};


/* ==========================================================
   CREATE PRODUCT
========================================================== */

exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            category,
            mrp,
            price,
            stock,
            featured,
            image
        } = req.body;


        /* --------------------------------------------------
           Validate Required Fields
        -------------------------------------------------- */

        if (
            !name ||
            !category ||
            mrp === undefined ||
            price === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Product name, category, MRP and price are required."
            });

        }


        /* --------------------------------------------------
           Generate Product ID
        -------------------------------------------------- */

        const productId =
            `product-${Date.now()}`;


        /* --------------------------------------------------
           Create Product
        -------------------------------------------------- */

        const product =
            await Product.create({

                productId,

                name,

                category,

                mrp:
                    Number(mrp),

                price:
                    Number(price),

                stock:
                    stock !== undefined
                        ? Number(stock)
                        : 0,

                featured:
                    Boolean(featured),

                image:
                    image || ""

            });


        /* --------------------------------------------------
           Response
        -------------------------------------------------- */

        res.status(201).json({

            success: true,

            message:
                "Product created successfully.",

            product

        });

    } catch (error) {

        console.error(
            "Create Product Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create product."

        });

    }

};
/* ==========================================================
   UPDATE PRODUCT
========================================================== */

exports.updateProduct = async (req, res) => {

    try {

        const {
            name,
            category,
            mrp,
            price,
            stock,
            featured,
            image
        } = req.body;


        const product =
            await Product.findOne({
                productId: req.params.productId
            });

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }


        if (name !== undefined)
            product.name = name;

        if (category !== undefined)
            product.category = category;

        if (mrp !== undefined)
            product.mrp = Number(mrp);

        if (price !== undefined)
            product.price = Number(price);

        if (stock !== undefined)
            product.stock = Number(stock);

        if (featured !== undefined)
            product.featured = Boolean(featured);

        if (image !== undefined)
            product.image = image;


        await product.save();


        res.json({

            success: true,

            message:
                "Product updated successfully.",

            product

        });

    } catch (error) {

        console.error(
            "Update Product Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update product."
        });

    }

};


/* ==========================================================
   DELETE PRODUCT
========================================================== */

exports.deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findOneAndDelete({
                productId: req.params.productId
            });

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }


        res.json({

            success: true,

            message:
                "Product deleted successfully."

        });

    } catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete product."
        });

    }

};