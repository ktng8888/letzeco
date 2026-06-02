const express = require('express');
const router = express.Router();
const achievementController = require('../../controllers/user/achievementController');
const verifyToken = require('../../middleware/authMiddleware');

// Note: /badges, /streak-rewards must be BEFORE /:id
router.get('/badges', verifyToken, achievementController.getBadges);
router.put('/badges/emblems', verifyToken, achievementController.updateEmblems);
router.get('/streak-rewards', verifyToken, achievementController.getStreakRewards);
router.post('/streak-rewards/claim/:id', verifyToken, achievementController.claimStreakReward);
router.get('/user/:id', verifyToken, achievementController.getUserAchievements);
router.get('/badges/:id', verifyToken, achievementController.getFriendBadges);
router.get('/', verifyToken, achievementController.getAchievements);

module.exports = router;
