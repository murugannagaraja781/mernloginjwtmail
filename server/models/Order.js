import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        name: String,
        qty: Number,
        sellPrice: Number,
        costPrice: Number,
      },
    ],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
