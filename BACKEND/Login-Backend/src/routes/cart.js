const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middlewares/auth.middleware.js");

/* ================= GET CART ================= */
router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  res.json(cart || { items: [] });
});

/* ================= ADD / UPDATE ITEM ================= */
router.post("/add", auth, async (req, res) => {
  const { productId, name, price, image, qty = 1 } = req.body;

  let cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    cart = new Cart({
      userId: req.userId,
      items: []
    });
  }

  const existing = cart.items.find(i => i.productId === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, name, price, image, qty });
  }

  await cart.save();
  res.json(cart);
});

/* ================= REMOVE ITEM ================= */
router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.json({ items: [] });

  cart.items = cart.items.filter(i => i.productId !== productId);
  await cart.save();

  res.json(cart);
});

/* ================= CLEAR CART ================= */
router.post("/clear", auth, async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.userId });
  res.json({ message: "Cart cleared" });
});

/* ================= MERGE GUEST CART ================= */
router.post("/merge", auth, async (req, res) => {
  const { items } = req.body; // guest cart items
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Invalid cart data" });
  }

  let cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    cart = new Cart({
      userId: req.userId,
      items: []
    });
  }

  items.forEach(guestItem => {
    const existing = cart.items.find(
      i => i.productId === guestItem.productId
    );

    if (existing) {
      existing.qty += guestItem.qty;
    } else {
      cart.items.push(guestItem);
    }
  });

  await cart.save();
  res.json({ message: "Cart merged successfully", cart });
});

module.exports = router;