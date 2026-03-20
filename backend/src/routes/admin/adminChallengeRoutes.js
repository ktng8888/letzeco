const express = require('express');
const router = express.Router();
const adminChallengeController = require('../../controllers/admin/adminChallengeController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminChallengeController.getAll);
router.get('/:id', verifyAdmin, adminChallengeController.getById);
router.post('/', verifyAdmin, adminChallengeController.create);
router.put('/:id', verifyAdmin, adminChallengeController.update);
router.delete('/:id', verifyAdmin, adminChallengeController.delete);

// Eligible actions
router.get('/:id/eligible-actions', verifyAdmin, adminChallengeController.getEligibleActions);
router.post('/:id/eligible-actions', verifyAdmin, adminChallengeController.addEligibleAction);
router.delete('/eligible-actions/:eligibleActionId', verifyAdmin, adminChallengeController.removeEligibleAction);

module.exports = router;