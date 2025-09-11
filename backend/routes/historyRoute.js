const express = require("express");
const router = express.Router();

// Controller functions
const { getAgentReports } = require("../controllers/agentReports");
const requireAuth = require("../middlware/requireAuth"); // attention au chemin

router.get("/history", requireAuth, getAgentReports);

module.exports = router;