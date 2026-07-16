const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const addressRoutes = require("./routes/addressRoutes");
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require("./routes/profile.routes");
const userRoutes = require("./routes/user");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());

/* Database */
connectDB();

/* Routes */
app.use('/api/auth', authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cart", require("./routes/cart"));
app.use("/api/user", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/order", orderRoutes);

/* Test route */
app.get('/', (req, res) => {
  res.send('Login backend is running 🚀');
});

module.exports = app;
