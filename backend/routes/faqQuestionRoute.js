const express = require("express");
const router = express.Router();

// Controller functions
const { getAgentFAQ } = require("../controllers/faqController");
const requireAuth = require("../middlware/requireAuth"); // vérifie l'orthographe

//router.use(requireAuth)
router.get("/treeFrequentQuestion", requireAuth, getAgentFAQ);

module.exports = router;