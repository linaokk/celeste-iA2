const express = require('express');
const router = express.Router();
//Controller functions 
const { loginUser, signupUser , createTestUser} = require('../controllers/userController');
//Login route
router.post('/login', loginUser);

//Signup route
router.post('/signup', signupUser);

//create user test 
router.post('/test', createTestUser);
module.exports = router