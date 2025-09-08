const express = require('express');
const router = express.Router();
//Controller functions 
const {/*getCallsThisMonth , getAverageCallDuration, getAverageCallCost*/getKpis}= require('../controllers/relantalController');
//Login route
// router.get('/getcallsThisMonth', getCallsThisMonth);
// router.get('/getAverageCallDuration', getAverageCallDuration)
// router.get('/getAverageCallCost', getAverageCallCost);
router.get('/getKpis', getKpis);
module.exports = router