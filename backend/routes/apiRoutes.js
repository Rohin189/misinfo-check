import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Report from "../models/Report.js";
import path from "path";
import {authMiddleware} from "../middleware/auth.js";


const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


router.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "frontend", "index.html"));
});

router.get("/guest", (req, res) => {
  res.sendFile(path.join(path.resolve(), "frontend", "index.html"));
});

// --- Guest Check (No DB save) ---
router.post("/guest", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: { response_mime_type: "application/json" },
    });

    const prompt = `
      You are a fact-checking expert. Analyze the following text: "${text}".
      Your response must be a valid JSON object with two keys: 1. "confidence": a number between 0.0 and 1.0 representing the likelihood that the text is factually true. 2. "explanation": a concise string explaining your reasoning for the assigned confidence score.
    `;

    const result = await model.generateContent(prompt);
    const aiResponseJson = JSON.parse(result.response.text());

    const confidence = Number(aiResponseJson.confidence) || 0;
    const confidencePercent = confidence * 100;

    let verdict;
    if (confidencePercent < 70) verdict = "False";
    else if (confidencePercent < 90) verdict = "Misleading";
    else if (confidencePercent < 100) verdict = "Likely True";
    else verdict = "True";

    res.json({
      success: true,
      verdict,
      explanation: aiResponseJson.explanation,
      confidence: confidencePercent,
    });

  } catch (err) {
    console.error("Guest check error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});


// --- Authenticated Check (DB Save) ---
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: { response_mime_type: "application/json" },
    });

    const prompt = `
      Analyze the following text: "${text}".
      Respond only in JSON:
      {
        "confidence": number (0.0 - 1.0),
        "explanation": string
      }
    `;

    const result = await model.generateContent(prompt);
    const aiResponseJson = JSON.parse(result.response.text());

    const confidence = Number(aiResponseJson.confidence) || 0;
    const confidencePercent = confidence * 100;

    let verdict;
    if (confidencePercent < 70) verdict = "False";
    else if (confidencePercent < 90) verdict = "Misleading";
    else if (confidencePercent < 100) verdict = "Likely True";
    else verdict = "True";

    // Save only for logged-in users
    const report = new Report({
      userId: req.userId,
      text,
      verdict,
      explanation: aiResponseJson.explanation,
      confidence,
    });
    await report.save();

    res.json({
      success: true,
      verdict,
      explanation: aiResponseJson.explanation,
      confidence: confidencePercent,
    });

  } catch (err) {
    console.error("User check error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});


router.get("/history", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const total = await Report.countDocuments({ userId: req.userId });
    const trueCount = await Report.countDocuments({ userId: req.userId, verdict: /True/i });
    const falseCount = await Report.countDocuments({ userId: req.userId, verdict: /False/i });
    const misleadingCount = await Report.countDocuments({ userId: req.userId, verdict: /Misleading/i });

    res.json({
      success: true,
      stats: { total, trueCount, falseCount, misleadingCount }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


export default router;
