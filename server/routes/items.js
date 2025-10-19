import express from "express";
import Item from "../models/Item.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = express.Router();

router.get("/", protect, async (req, res) => {
  const items = await Item.find().sort("name");
  res.json(items);
});

router.post("/", protect, adminOnly, async (req, res) => {
  const { name, category, sellPrice, costPrice, stock } = req.body;
  try {
    const item = await Item.create({
      name,
      category,
      sellPrice,
      costPrice,
      stock,
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(item);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;
