const express = require("express");
const router = express.Router();
const { createTestUser } = require("../controllers/userController");

// POST /api/users/test
router.post("/test", createTestUser);

module.exports = router;