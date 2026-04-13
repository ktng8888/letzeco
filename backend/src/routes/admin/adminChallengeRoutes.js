const express = require('express');
const router = express.Router();
const adminChallengeController = require('../../controllers/admin/adminChallengeController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadChallenge } = require('../../utils/uploadService');

router.get('/', verifyAdmin, adminChallengeController.getAll);
router.get('/:id', verifyAdmin, adminChallengeController.getById);
router.post(
  '/',
  verifyAdmin,
  uploadChallenge.single('image'),
  adminChallengeController.create
);
router.put(
  '/:id',
  verifyAdmin,
  uploadChallenge.single('image'),
  adminChallengeController.update
);
router.delete('/:id', verifyAdmin, adminChallengeController.delete);
router.get('/:id/eligible-actions', verifyAdmin, adminChallengeController.getEligibleActions);
router.post('/:id/eligible-actions', verifyAdmin, adminChallengeController.addEligibleAction);
router.delete('/:id/eligible-actions/:eligibleActionId', verifyAdmin, adminChallengeController.removeEligibleAction);

module.exports = router;