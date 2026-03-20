const express = require('express');
const router = express.Router();
const proofController = require('../../controllers/user/proofController');
const verifyToken = require('../../middleware/authMiddleware');
const { uploadProof } = require('../../utils/uploadService');

router.get('/action/:actionId', verifyToken, proofController.getProofByAction);
router.post(
  '/upload/:userActionId',
  verifyToken,
  uploadProof.single('image'),
  proofController.uploadProofPhoto
);

module.exports = router;