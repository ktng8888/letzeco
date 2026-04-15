const express = require('express');
const router = express.Router();
const adminAchievementController = require('../../controllers/admin/adminAchievementController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadBadge } = require('../../utils/uploadService');
const multer = require('multer');

// For batch create — accept image_0, image_1, image_2... (max 10 rows)
const uploadBadgeFields = uploadBadge.fields([
  { name: 'image_0', maxCount: 1 },
  { name: 'image_1', maxCount: 1 },
  { name: 'image_2', maxCount: 1 },
  { name: 'image_3', maxCount: 1 },
  { name: 'image_4', maxCount: 1 },
  { name: 'image_5', maxCount: 1 },
  { name: 'image_6', maxCount: 1 },
  { name: 'image_7', maxCount: 1 },
  { name: 'image_8', maxCount: 1 },
  { name: 'image_9', maxCount: 1 },
]);

// For update — single image field
const uploadBadgeSingle = uploadBadge.fields([
  { name: 'image', maxCount: 1 },
]);

router.get('/', verifyAdmin, adminAchievementController.getAll);
router.get('/:id', verifyAdmin, adminAchievementController.getById);
router.post('/', verifyAdmin, uploadBadgeFields, adminAchievementController.createBatch);
router.put('/:id', verifyAdmin, uploadBadgeSingle, adminAchievementController.update);
router.delete('/:id', verifyAdmin, adminAchievementController.delete);

module.exports = router;