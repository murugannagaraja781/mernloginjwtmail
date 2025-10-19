import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST add new item
router.post("/", async (req, res) => {
  try {
    const { name, sellPrice, category, stock, costPrice } = req.body;

    // Validate required fields
    if (!name || sellPrice === undefined) {
      return res.status(400).json({ msg: "Name and Sell Price are required" });
    }

    // Create new item document
    const newItem = new Item({
      name,
      sellPrice,
      category: category || "General",
      stock: stock || 0,
      costPrice: costPrice || 0,
    });

    await newItem.save(); // Save to MongoDB

    res.status(201).json({ message: "Item created", item: newItem });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE item by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Item not found" });
    res.json({ msg: "Item deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
