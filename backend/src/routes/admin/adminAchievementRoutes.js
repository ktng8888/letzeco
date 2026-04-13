const express = require('express');
const router = express.Router();
const adminAchievementController = require('../../controllers/admin/adminAchievementController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadBadge } = require('../../utils/uploadService');

router.get('/', verifyAdmin, adminAchievementController.getAll);
router.get('/:id', verifyAdmin, adminAchievementController.getById);
router.post('/', verifyAdmin, uploadBadge.single('image'), adminAchievementController.create);
router.put('/:id', verifyAdmin, uploadBadge.single('image'), adminAchievementController.update);
router.delete('/:id', verifyAdmin, adminAchievementController.delete);

module.exports = router;