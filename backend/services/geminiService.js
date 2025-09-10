    require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.API_GEMINI,
});

async function askGemini(prompt, model = "gemini-2.5-flash") {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    console.log("✅ Réponse Gemini reçue");
    return response.text;
  } catch (err) {
    console.error("❌ Erreur Gemini:", err.message);
    return null;
  }
}

module.exports = { askGemini };