const express = require('express');
const router = express.Router();
const adminBadgeController = require('../../controllers/admin/adminBadgeController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadBadge } = require('../../utils/uploadService');

router.get('/', verifyAdmin, adminBadgeController.getAll);
router.get('/:id', verifyAdmin, adminBadgeController.getById);
router.post(
  '/',
  verifyAdmin,
  uploadBadge.single('image'),
  adminBadgeController.create
);
router.put(
  '/:id',
  verifyAdmin,
  uploadBadge.single('image'),
  adminBadgeController.update
);
router.delete('/:id', verifyAdmin, adminBadgeController.delete);

module.exports = router;