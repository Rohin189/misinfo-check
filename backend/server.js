// server.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

// Routes
import apiRoutes from "./routes/apiRoutes.js"; // Misinformation checker (if you have it)
import authRoutes from "./routes/userRoutes.js"; // Handles /signup, /login, /logout
import dashboardRoutes from "./routes/dashboard.js"; // Handles protected /dashboard DATA

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const corsOptions = {
  origin: 'https://misinfo-check.onrender.com'
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), "frontend")));

// --- API Routes ---
// Public routes for checking and authentication
app.use("/api/check", apiRoutes);
app.use("/api/user", authRoutes); 

// Protected route for dashboard data
app.use("/api/user", dashboardRoutes); // The route inside will be /dashboard

// --- Final Fallback for Single Page Applications ---
// This will serve index.html for any route not matched above
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "frontend", "index.html"));
});

// --- MongoDB & Server Start ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
