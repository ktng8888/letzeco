const express = require('express');
const router = express.Router();
const userActionController = require('../../controllers/user/userActionController');
const verifyToken = require('../../middleware/authMiddleware');

// All routes require login
router.post('/start/:actionId', verifyToken, userActionController.start);
router.put('/complete/:id', verifyToken, userActionController.complete);
router.put('/cancel/:id', verifyToken, userActionController.cancel);
//router.delete('/cancel/:id', verifyToken, userActionController.cancel);
router.get('/today', verifyToken, userActionController.getToday);
router.get('/history', verifyToken, userActionController.getHistory);
router.get('/history/:id', verifyToken, userActionController.getHistoryById);

module.exports = router;