import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import itemRouter from "./routes/itemRoute.js";
import orderRouter from "./routes/ordersRoute.js";

dotenv.config(); // Load environment variables
connectDB(); // ✅ Connect to MongoDB

const app = express();

// ✅ Middleware must come first
app.use(
  cors({
    origin: "https://mernloginjwtmail.vercel.app", // React app URL
    credentials: true,
  })
);
app.use(express.json()); // parse JSON body

// ✅ Routes
app.use("/api/items", itemRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// ✅ Catch-all 404 (must come last)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", url: req.originalUrl });
});

// ✅ Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
