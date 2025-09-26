const express = require("express");
const router = express.Router();

// Controller functions
const { getAgentFAQ , getAudios} = require("../controllers/faqController");
const requireAuth = require("../middlware/requireAuth"); // vérifie l'orthographe
const { getBaseTemplate , getEventByBot, getAllBots, getAllUsers, getStatesByBot, getUseCaseById} = require("../services/asklabBotServices");
const { getBotKpis } = require("../controllers/asklabBotController");

//router.use(requireAuth)
router.get("/treeFrequentQuestion", requireAuth, getAgentFAQ);
router.get("/audios", requireAuth,getAudios )
router.get("/api/asklab/kpi",getBotKpis)
router.get("/allTest", getAllBots)
router.get('/allUser', getAllUsers)
router.post('/stateTest', getStatesByBot)
router.get('/usecase', getUseCaseById)

module.exports = router;