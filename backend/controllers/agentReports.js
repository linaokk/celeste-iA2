const AgentMonthlyReports = require("../models/agentReportModel.js");

const getAgentReports = async (req, res) => {
  try {
    const { agentId } = req.query;
    if (!agentId) {
      return res.status(400).json({ message: "agentId manquant" });
    }

    const agentReport = await AgentMonthlyReports.findOne({ agentId });
    if (!agentReport) {
      return res.status(404).json({ message: "Aucun rapport trouvé" });
    }

    const history = agentReport.reports.map(r => ({
      month: r.month,
      pdfData: r.pdfData.toString("base64"), 
      createdAt: r.createdAt,
    }));

    res.json({ agentId, history });
  } catch (err) {
    console.error("❌ Erreur getAgentReports:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getAgentReports };
