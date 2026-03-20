const express = require('express');
const router = express.Router();
const leaderboardController = require('../../controllers/user/leaderboardController');
const verifyToken = require('../../middleware/authMiddleware');

router.get('/global', verifyToken, leaderboardController.getGlobal);
router.get('/friends', verifyToken, leaderboardController.getFriends);

module.exports = router;