require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const connectDB = require("../config/db");

const products = [
    {
        productId: "product-001",
        name: "Lays Classic Salted",
        category: "snacks",
        mrp: 20,
        price: 20,
        stock: 42,
        featured: true,
        image: "../../../../Assets/Images/Products/lays.jpg"
    },
    {
        productId: "product-002",
        name: "Maggi 2-Minute Noodles",
        category: "instant-food",
        mrp: 15,
        price: 14,
        stock: 75,
        featured: true,
        image: "../../../../Assets/Images/Products/maggi.jpg"
    },
    {
        productId: "product-003",
        name: "Dairy Milk Silk",
        category: "chocolate",
        mrp: 80,
        price: 75,
        stock: 25,
        featured: false,
        image: "../../../../Assets/Images/Products/dairy-milk.jpg"
    },
    {
        productId: "product-004",
        name: "Oreo Original",
        category: "biscuits",
        mrp: 40,
        price: 38,
        stock: 0,
        featured: false,
        image: "../../../../Assets/Images/Products/oreo.jpg"
    },
    {
        productId: "product-005",
        name: "Red Bull Energy Drink",
        category: "beverages",
        mrp: 130,
        price: 120,
        stock: 14,
        featured: true,
        image: "../../../../Assets/Images/Products/red-bull.jpg"
    },
    {
        productId: "product-006",
        name: "Tropicana Orange 200ml",
        category: "beverages",
        mrp: 30,
        price: 28,
        stock: 60,
        featured: false,
        image: "../../../../Assets/Images/Products/tropicana.jpg"
    },
    {
        productId: "product-007",
        name: "Haldiram's Aloo Bhujia",
        category: "snacks",
        mrp: 30,
        price: 28,
        stock: 3,
        featured: false,
        image: "../../../../Assets/Images/Products/aloo-bhujia.jpg"
    },
    {
        productId: "product-008",
        name: "Britannia Marie Gold",
        category: "biscuits",
        mrp: 25,
        price: 22,
        stock: 41,
        featured: false,
        image: "../../../../Assets/Images/Products/britannia-marie.jpg"
    },
    {
        productId: "product-009",
        name: "Thums Up 600ml",
        category: "beverages",
        mrp: 40,
        price: 38,
        stock: 28,
        featured: false,
        image: "../../../../Assets/Images/Products/thums-up.jpg"
    },
    {
        productId: "product-010",
        name: "Kit Kat 4-Finger",
        category: "chocolate",
        mrp: 50,
        price: 45,
        stock: 19,
        featured: false,
        image: "../../../../Assets/Images/Products/kitkat.jpg"
    }
];

async function seedProducts() {

    try {

        await connectDB();

        await Product.deleteMany({});

        await Product.insertMany(products);

        console.log(
            `✅ ${products.length} products inserted successfully.`
        );

    } catch (error) {

        console.error(
            "❌ Product seed error:",
            error
        );

    } finally {

        await mongoose.connection.close();

    }

}

seedProducts();