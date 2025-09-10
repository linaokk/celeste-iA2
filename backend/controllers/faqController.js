const express = require("express");
const router = express.Router();
const AgentFAQ = require("../models/agentFAQModel");

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
module.exports = { getAgentFAQ };