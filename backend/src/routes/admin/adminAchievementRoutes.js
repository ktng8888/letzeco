const express = require('express');
const router = express.Router();
const adminAchievementController = require('../../controllers/admin/adminAchievementController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminAchievementController.getAll);
router.get('/:id', verifyAdmin, adminAchievementController.getById);
router.post('/', verifyAdmin, adminAchievementController.create);
router.put('/:id', verifyAdmin, adminAchievementController.update);
router.delete('/:id', verifyAdmin, adminAchievementController.delete);

module.exports = router;