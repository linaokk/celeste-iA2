const mongoose = require("mongoose");
const UserCallTranscript = require("../models/userTranscriptModel");
const AgentFAQ = require("../models/agentFAQModel");
const { askGemini } = require("../services/geminiService");
const { getCalls, getCallDetails } = require("../controllers/relantalController");
const { extractTopNQuestionsFromText, normalizeGeminiResponseToString } = require("../utils/geminiUtils");

async function getTranscriptsForLastWeek() {
  const today = new Date(); // Samedi
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 6); // Les 7 derniers jours
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);

  const calls = await getCalls();

  const callsThisWeek = calls
  .filter(c => { 
    const date = new Date(c.timestamp);
    return date >= startOfWeek && date <= endOfWeek; 
  });
  // 2️⃣ Récupérer les détails des appels
  const detailsPromises = callsThisWeek.map(c => getCallDetails(c.id));
  const detailsCalls = await Promise.all(detailsPromises);

  // 3️⃣ Filtrer uniquement ceux avec transcript
  const callsWithTranscript = detailsCalls.filter(c => c.transcript && c.transcript.length > 0);
  console.log("callsWithTranscript", callsWithTranscript);

  if (callsWithTranscript.length !== 0) {
    const filtered = callsWithTranscript
      .map(call => ({
        agentId: call.agent_id,
        transcripts: call.transcript
          .filter(msg => msg.role === "user" && msg.content)
          .map(msg => "user: " + msg.content)
      }))
      .filter(call => call.transcripts.length > 0);

    // 2️⃣ Regrouper par agentId (similaire à $group + $reduce)
    const agentsMap = new Map();
    filtered.forEach(call => {
      if (!agentsMap.has(call.agentId)) agentsMap.set(call.agentId, []);
      agentsMap.get(call.agentId).push(...call.transcripts);
    });

    // 3️⃣ Transformer la map en tableau
    return Array.from(agentsMap.entries()).map(([agentId, transcripts]) => ({
      agentId,
      transcripts
    }));
  } else {
    return [];
  }
}

async function weeklyFAQBatch() {
  console.log("🟢 Lancement du batch FAQ hebdomadaire...");

  // Supprimer les anciennes FAQ
  await AgentFAQ.deleteMany({});

  const transcriptsByAgent = await getTranscriptsForLastWeek();
  console.log("transcriptsByAgent", transcriptsByAgent);

  for (const agent of transcriptsByAgent) {
    const joined = agent.transcripts.join("\n");

    const prompt = `
Analyse toutes les interactions suivantes de la base de données vocale pour l'agent ${agent.agentId} :
${joined}

Consignes :
1. Ignore systématiquement les phrases de politesse.
2. Identifie uniquement les questions pertinentes (besoin concret, demande explicite, problème lié au service).
3. Regroupe les questions qui ont le même sens, même si les mots ou la formulation sont différents.
4. Classe les groupes par fréquence décroissante.
5. Donne uniquement les 3 questions les plus fréquentes et indique leur fréquence (ex: "(3)").
6. Ne donne rien d'autre que ces questions et leurs fréquences.
    `;

    const response = await askGemini(prompt);
    console.log("response", response);

    if (!response) continue;

    // Normaliser en string puis extraire top3 questions
    const rawText = normalizeGeminiResponseToString(response);
    console.log("✅ Réponse Gemini reçue (preview):", rawText.slice(0, 200).replace(/\n/g, " "));

    const questions = extractTopNQuestionsFromText(rawText);
    console.log("extracted questions", questions);

    if (!questions.length) {
      console.log(`⚠️ Aucune question extraite pour agent ${agent.agentId}`);
      continue;
    }

    await AgentFAQ.create({
      agentId: agent.agentId,
      questions
    });

    console.log(`✅ FAQ enregistrée pour agent ${agent.agentId}`);
  }

  console.log("🔴 Fin du batch FAQ hebdomadaire.");
}

module.exports = { weeklyFAQBatch };

/*======================== UTILS ========================*/
