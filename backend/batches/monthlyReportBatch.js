const path = require("path");
const {generatePDFBuffer} = require("../services/DocumentService");
const { askGemini } = require("../services/geminiService");
const { getCalls, getCallDetails } = require("../controllers/relantalController");
const { extractTopNQuestionsFromText, normalizeGeminiResponseToString } = require("../utils/geminiUtils");
const User = require("../models/userModel"); 
const AgentMonthlyReports = require("../models/agentReportModel");
async function getTranscriptsForMonth() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const calls = await getCalls();
  const callsThisMonth = calls.filter(c => {
    const date = new Date(c.timestamp || c.start_time);
    return date >= startOfMonth && date <= endOfMonth;
  });
  const detailsPromises = callsThisMonth.map(c => getCallDetails(c.id));
  const detailsCalls = await Promise.all(detailsPromises);
  const callsWithTranscript = detailsCalls.filter(c => c.transcript && c.transcript.length > 0);
  if (callsWithTranscript.length === 0) return [];
  const filtered = callsWithTranscript.map(call => ({
    agentId: call.agent_id,
    transcripts: call.transcript
      .filter(msg => msg.role === "user" && msg.content)
      .map(msg => "user: " + msg.content)
  })).filter(call => call.transcripts.length > 0);
  const agentsMap = new Map();
  filtered.forEach(call => {
    if (!agentsMap.has(call.agentId)) agentsMap.set(call.agentId, []);
    agentsMap.get(call.agentId).push(...call.transcripts);
  });
  return Array.from(agentsMap.entries()).map(([agentId, transcripts]) => ({
    agentId,
    transcripts
  }));
}
async function monthlyFAQBatch() {
  console.log("🟢 Lancement du batch FAQ mensuel...");

  const transcriptsByAgent = await getTranscriptsForMonth();
  const reportData = [];

  for (const agent of transcriptsByAgent) {
    // Skip si pas de transcripts
    if (!agent.transcripts || agent.transcripts.length === 0) {
      console.log(`⚠️ Aucun transcript pour agentId ${agent.agentId}, skip...`);
      continue;
    }

    const joined = agent.transcripts.join("\n");

    const prompt = `
Analyse toutes les interactions suivantes de la base vocale pour l'agent ${agent.agentId} :
${joined}

Consignes :
1. Ignore les phrases de politesse.
2. Identifie uniquement les questions pertinentes.
3. Classe par fréquence décroissante.
4. Donne uniquement les 10 plus fréquentes, rien d'autre.
    `;

    const response = await askGemini(prompt);
    console.log("Gemini response:", response);

    if (!response) {
      console.log(`⚠️ Pas de réponse de Gemini pour agentId ${agent.agentId}, skip...`);
      continue;
    }

    const rawText = normalizeGeminiResponseToString(response);
    const questions = extractTopNQuestionsFromText(rawText, 10);

    // Chercher le user associé
    const user = await User.findOne({ agentId: agent.agentId });
    if (!user) {
      console.log(`⚠️ Aucun user trouvé pour agentId ${agent.agentId}, skip...`);
      continue; 
    }

    const companyName = user.companyName || `Company_${agent.agentId}`;
    const agentId = user.agentId || agent.agentId;
    reportData.push({
      agentId: agentId,
      numberOfCalls: agent.transcripts.length,
      questions,
      companyName
    });

    console.log("reportData=>", reportData);

    // Génération PDF
    const pdfBuffer = await generatePDFBuffer(agentId, companyName, questions, agent.transcripts.length);

    // Sauvegarde dans la base
    await saveMonthlyReport(agentId, pdfBuffer);
  }

  console.log("🔴 Fin du batch FAQ mensuel.");
}

module.exports = { monthlyFAQBatch };





// =================== PDF ===================
module.exports = { monthlyFAQBatch };
async function saveMonthlyReport(agentId, pdfBuffer) {
  const monthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const existing = await AgentMonthlyReports.findOne({ agentId });

  if (existing) {
    const alreadyExists = existing.reports.some(r => r.month === monthStr);
    if (!alreadyExists) {
      existing.reports.push({
        agentId, 
        month: monthStr,
        pdfData: pdfBuffer,
      });
      await existing.save();
    }
  } else {
    await AgentMonthlyReports.create({
      agentId,
      reports: [
        {
          agentId, 
          month: monthStr,
          pdfData: pdfBuffer,
        }
      ]
    });
  }
}

