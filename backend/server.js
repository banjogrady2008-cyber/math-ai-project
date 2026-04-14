import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `
You are a patient math tutor.

Always use LaTeX math notation:
- Inline math: $...$
- Display math: $$...$$

Rules:
1. Guide students step by step.
2. Ask what the next step is.
3. Do NOT give final answers immediately.
4. Adjust difficulty to the student's grade and comfort.
5. Encourage and explain clearly.
`
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const result = await model.generateContent({
      contents: [
        ...(history || []),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const reply = result.response.text();
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));