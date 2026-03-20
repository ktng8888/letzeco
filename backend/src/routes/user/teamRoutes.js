const express = require('express');
const router = express.Router();
const teamController = require('../../controllers/user/teamController');
const verifyToken = require('../../middleware/authMiddleware');

router.post('/', verifyToken, teamController.create);
router.get('/public/:challengeId', verifyToken, teamController.getPublicTeams);
router.get('/:id', verifyToken, teamController.getById);
router.post('/join/public/:teamId', verifyToken, teamController.joinPublic);
router.post('/join/code', verifyToken, teamController.joinByCode);
router.delete('/:id/leave', verifyToken, teamController.leave);

module.exports = router;