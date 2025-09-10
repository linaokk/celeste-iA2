const express = require("express");
const router = express.Router();

const { getAgentFAQ } = require("../controllers/faqController");

router.get("/treeFrequentQuestion", getAgentFAQ);
module.exports = router; 