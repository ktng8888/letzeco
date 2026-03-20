const express = require('express');
const router = express.Router();
const adminStreakRewardController = require('../../controllers/admin/adminStreakRewardController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminStreakRewardController.getAll);
router.get('/:id', verifyAdmin, adminStreakRewardController.getById);
router.post('/', verifyAdmin, adminStreakRewardController.create);
router.put('/:id', verifyAdmin, adminStreakRewardController.update);
router.delete('/:id', verifyAdmin, adminStreakRewardController.delete);

module.exports = router;