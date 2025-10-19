// server.js
import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
dotenv.config(); // Load environment variables

// ✅ Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());

// ✅ Test route
// API END POINT
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});
app.use("/api/auth", authRouter);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
