const express = require('express');
const router = express.Router();
const streakController = require('../../controllers/user/streakController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/check-reset', authMiddleware, streakController.checkResetStreak);

module.exports = router;