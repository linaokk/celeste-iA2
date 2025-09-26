const express = require("express");
const router = express.Router();
const {getBotKpis} = require('../controllers/asklabBotController.js')
router.get("/getKpis", getBotKpis);

module.exports= router