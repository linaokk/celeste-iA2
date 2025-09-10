const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  month: { type: String, required: true }, 
  pdfData: { type: Buffer }, 
  createdAt: { type: Date, default: Date.now }
});

// Index pour retrouver rapidement le rapport d'un agent pour un mois donné
const agentMonthlyReportsSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  reports: [reportSchema]
});
module.exports = mongoose.model("AgentReport", agentMonthlyReportsSchema);