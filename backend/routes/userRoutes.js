import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import path from "path";

const router = express.Router();

// --- Signup ---
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: "All fields required" });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: "User already exists" });

    // Hash password

    // Save user
    const user = new User({ name, email, password});
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set cookie
    res.cookie("token", token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production", // change to true in production with HTTPS
      sameSite: "strict"
    });

    res.json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: email,        // raw email
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/signup", (req, res) => {
  // This line will no longer throw an error
  res.sendFile(path.join(path.resolve(), "frontend", "signup.html"));
});



// --- Login ---
router.post("/login", async (req, res) => {
  console.log("Raw headers:", req.headers["content-type"]);
  console.log("Login request body:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    if (password !== user.password) {
      
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    console.log("Raw password:", password);

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("Login server error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/login", (req, res) => {
  // This line will no longer throw an error
  res.sendFile(path.join(path.resolve(), "frontend", "login.html"));
});



// --- Logout ---
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});


//-- Dashboard--

export default router;
