function extractTopNQuestionsFromText(rawText, n = 3) {
  if (!rawText || typeof rawText !== "string") return [];

  // Utiliser la fonction qui extrait questions + fréquence
  const questionsWithFreq = extractQuestionsWithFrequency(rawText);

  // Nettoyer le texte si besoin
  const cleaned = questionsWithFreq.map(({ question, frequency }) => ({
    question: question
      .replace(/^[-*•\d\.\)\s]+/, "") // enlever puces / numéros
      .replace(/\*\*/g, "")
      .replace(/^\[?user\]?:?\s*/i, "")
      .replace(/[:\-–—]+$/g, "")
      .trim(),
    frequency,
  }));

  // Trier par fréquence décroissante et prendre top n
  return cleaned
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, n);
}



function normalizeGeminiResponseToString(response) {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (typeof response === "object") {
    if (typeof response.text === "string") return response.text;
    if (typeof response.outputText === "string") return response.outputText;
    if (Array.isArray(response)) return response.join("\n");
    try { return JSON.stringify(response); } catch { return String(response); }
  }
  return String(response);
}

module.exports = { extractTopNQuestionsFromText , normalizeGeminiResponseToString};
function extractQuestionsWithFrequency(rawText) {
  const regex = /^\s*(?:\d+\.\s*)?(.*?)(?:\s*\((\d+)\))?\s*$/gm;
  const results = [];
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const question = match[1].trim();
    const frequency = match[2] ? parseInt(match[2], 10) : 1; // si pas de (n), mettre 1
    if (question) results.push({ question, frequency });
  }

  return results;
}
