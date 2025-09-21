// models/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  verdict: { type: String, required: true },
  explanation: { type: String },
  confidence: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", ReportSchema);
