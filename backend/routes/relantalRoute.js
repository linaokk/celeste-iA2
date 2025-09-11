const express = require("express");
const router = express.Router();
//Controller functions 
const { getKpis } = require("../controllers/relantalController");
const requireAuth = require("../middlware/requireAuth"); // CommonJS

router.get('/getKpis',requireAuth, getKpis);
module.exports = router;
