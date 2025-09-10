const express = require('express');
const router = express.Router();
const {getAgentReports} = require('../controllers/agentReports');
router.get('/history', getAgentReports);
module.exports = router