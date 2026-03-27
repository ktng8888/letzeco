const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/user/progressController');
const verifyToken = require('../../middleware/authMiddleware');

router.get('/', verifyToken, progressController.getProgress);
router.get('/co2-breakdown', verifyToken, progressController.getCo2Breakdown);
router.get('/litre-breakdown', verifyToken, progressController.getLitreBreakdown);
router.get('/kwh-breakdown', verifyToken, progressController.getKwhBreakdown);
router.get('/comparison', verifyToken, progressController.getComparison);
router.get('/trend', verifyToken, progressController.getTrend);
router.get('/user/:userId', verifyToken, progressController.getUserProgress);

module.exports = router;