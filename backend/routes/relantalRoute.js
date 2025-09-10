const express = require('express');
const router = express.Router();
//Controller functions 
const {getKpis}= require('../controllers/relantalController');
router.get('/getKpis', getKpis);
module.exports = router