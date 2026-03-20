const express = require('express');
const router = express.Router();
const challengeController = require('../../controllers/user/challengeController');
const verifyToken = require('../../middleware/authMiddleware');

// Note: /my must be BEFORE /:id
router.get('/my', verifyToken, challengeController.getMyChallenges);
router.get('/', verifyToken, challengeController.getAll);
router.get('/:id', verifyToken, challengeController.getById);
router.post('/:id/join', verifyToken, challengeController.joinSolo);
router.delete('/:id/leave', verifyToken, challengeController.leave);

module.exports = router;