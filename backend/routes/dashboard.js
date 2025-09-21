// backend/routes/dashboard.js
import express from "express";
import {authMiddleware}  from "../middleware/auth.js";
import User from "../models/User.js";
import path from "path";


const router = express.Router();

// This is a protected API endpoint. It only sends data.
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // 'req.userId' is attached by the authMiddleware
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user: user });
    // Send user data back as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
