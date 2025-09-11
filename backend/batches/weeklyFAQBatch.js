const mongoose = require("mongoose");
const UserCallTranscript = require("../models/userTranscriptModel");
const AgentFAQ = require("../models/agentFAQModel");
const { askGemini } = require("../services/geminiService");
const {getCalls, getCallDetails}= require("../controllers/relantalController");
const { extractTopNQuestionsFromText, normalizeGeminiResponseToString } = require("../utils/geminiUtils");
async function getTranscriptsForLastWeek() {
  const today = new Date();
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);

  const calls = await getCalls();

  // 1️⃣ Filtrer les appels de la semaine (à décommenter après test)
  // const callsThisWeek = calls.filter(c => {
  //   const date = new Date(c.start_time);
  //   return date >= startOfWeek && date <= endOfWeek;
  // });

  const callsThisWeek = calls; // a commenté apres le test 

  // 2️⃣ Récupérer les détails (transcripts)
  const detailsPromises = callsThisWeek.map(c => getCallDetails(c.id));
  const detailsCalls = await Promise.all(detailsPromises);

  // 3️⃣ Conserver ceux avec transcript (optionnel)
  const callsWithTranscript = detailsCalls.filter(c => c.transcript && c.transcript.length > 0);

  // 4️⃣ Regrouper par agent
  const agentsMap = new Map();
  callsThisWeek.forEach(c => {
    if (!agentsMap.has(c.agent_id)) {
      agentsMap.set(c.agent_id, { transcripts: [], audios: [] });
    }
      let duration = 0;
  if (c.start_time && c.end_time) {
    const start = new Date(c.start_time);
    const end = new Date(c.end_time);
    duration = (end - start) / 1000; // durée en secondes
  }
    if (c.recording_url) {
      agentsMap.get(c.agent_id).audios.push({
        url : c.recording_url, 
        callDate: new Date(c.start_time), 
        from_number : c.from_number, 
        duration : duration, 
      });
    }
  });

  callsWithTranscript.forEach(call => {
    const transcripts = call.transcript
      .filter(msg => msg.role === "user" && msg.content)
      .map(msg => "user: " + msg.content);

    if (transcripts.length > 0) {
      agentsMap.get(call.agent_id).transcripts.push(...transcripts);
    }
  });

  return Array.from(agentsMap.entries()).map(([agentId, { transcripts, audios }]) => ({
    agentId,
    transcripts,
    audios
  }));
}


async function weeklyFAQBatch() {
  console.log("🟢 Lancement du batch FAQ hebdomadaire...");

  // Supprimer les anciennes FAQ
  await AgentFAQ.deleteMany({});

  const transcriptsByAgent = await getTranscriptsForLastWeek();
  console.log("transcriptsByAgent", transcriptsByAgent)

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

    // normaliser en string puis extraire top3 questions
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
      questions,
      audios: agent.audios, // 🔥 on stocke aussi les audios
    });

    console.log(`✅ FAQ enregistrée pour agent ${agent.agentId}`);
  }
  console.log("🔴 Fin du batch FAQ hebdomadaire.");
}

module.exports = { weeklyFAQBatch };
/*======================== UTILS ========================*/

  