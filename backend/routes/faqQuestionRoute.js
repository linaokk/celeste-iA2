const express = require("express");
const router = express.Router();

// Controller functions
const { getAgentFAQ , getAudios} = require("../controllers/faqController");
const requireAuth = require("../middlware/requireAuth"); // vérifie l'orthographe

//router.use(requireAuth)
router.get("/treeFrequentQuestion", requireAuth, getAgentFAQ);
router.get("/audios", requireAuth,getAudios )

module.exports = router;