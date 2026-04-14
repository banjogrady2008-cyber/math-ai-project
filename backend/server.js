import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

// 🔒 Allow ONLY your frontend domain (CHANGE AFTER DEPLOY)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🚫 Rate limiting (cheap protection)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25
});
app.use(limiter);

// 🧠 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `
You are a patient math tutor.

Use LaTeX math notation.
Guide step-by-step.
Do NOT give final answers immediately.
Keep responses concise unless asked for more detail.
`
});

// 💾 Simple cache (saves money)
const cache = new Map();

// 📊 Daily usage tracker
const usage = {};

app.post("/chat", async (req, res) => {
  try {
    const ip = req.ip;

    // Limit per day (200 messages)
    usage[ip] = usage[ip] || 0;
    if (usage[ip] > 200) {
      return res.status(429).json({ error: "Daily limit reached" });
    }

    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Only keep last few messages (cost control)
    const recentHistory = chatHistory.slice(-6);

    const lastUserMessage =
      recentHistory[recentHistory.length - 1]?.parts?.[0]?.text || "";

    if (lastUserMessage.length > 500) {
      return res.status(400).json({ error: "Message too long" });
    }

    // 💾 Cache check
    if (cache.has(lastUserMessage)) {
      return res.json({ text: cache.get(lastUserMessage) });
    }

    const result = await model.generateContent({
      contents: recentHistory
    });

    const text = result.response.text();

    // Save to cache
    cache.set(lastUserMessage, text);

    usage[ip]++;

    res.json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});