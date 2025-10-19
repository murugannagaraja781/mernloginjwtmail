import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    let revenue = 0;
    let cost = 0;

    orders.forEach((o) => {
      revenue += o.total;
      o.items.forEach((it) => (cost += it.costPrice * it.qty));
    });

    const profit = revenue - cost;

    res.json({ orders, revenue, cost, profit });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST create new order
router.post("/", async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !items.length || !total) {
      return res.status(400).json({ msg: "Items and total are required" });
    }

    const newOrder = new Order({ items, total });
    await newOrder.save();

    res.status(201).json({ message: "Order created", order: newOrder });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
