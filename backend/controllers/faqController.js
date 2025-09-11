const express = require("express");
const router = express.Router();
const AgentFAQ = require("../models/agentFAQModel");
const { getCalls } = require("../controllers/relantalController");

const getAgentFAQ = async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ message: "agentId manquant" });
    }

    const faq = await AgentFAQ.findOne({ agentId });
    if (!faq) {
      return res.status(400).json({ message: "Aucune FAQ trouvée" });
    }

    res.json({ agentId, faq: faq });
  } catch (err) {
    console.error("❌ Erreur getAgentFAQ:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
const getAudios = async (req, res) => {
  try {
    const calls = await getCalls();
    const { agentId } = req.query;
    // 1️⃣ Filtrer les appels de la semaine (à décommenter après test)
    // const callsThisWeek = calls.filter(c => {
    //   const date = new Date(c.start_time);
    //   return date >= startOfWeek && date <= endOfWeek;
    // });

    const agentsMap = new Map();
    const callsThisWeek = calls;
    let audios; 
    callsThisWeek.forEach(c => {
      if (!agentsMap.has(c.agent_id)) {
        agentsMap.set(c.agent_id, {  audios: [] });
      }

      let duration = 0;
      if (c.start_time && c.end_time) {
        const start = new Date(c.start_time);
        const end = new Date(c.end_time);
        duration = (end - start) / 1000;
      }

      if (c.recording_url) {
        agentsMap.get(c.agent_id).audios.push({
          url: c.recording_url,
          callDate: new Date(c.start_time),
          from_number: c.from_number,
          duration
        });
      }
    });

    const result = Array.from(agentsMap.entries()).map(([agentId, { audios }]) => ({
      agentId,
      audios
    }));
    const filteredResult = agentId 
      ? result.filter(agent => agent.agentId === agentId)
      : result;    return res.status(200).json(filteredResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = { getAgentFAQ , getAudios };