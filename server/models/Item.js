import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    sellPrice: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 9999 },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
