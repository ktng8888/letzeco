const express = require('express');
const router = express.Router();
const adminBadgeController = require('../../controllers/admin/adminBadgeController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminBadgeController.getAll);
router.get('/:id', verifyAdmin, adminBadgeController.getById);
router.post('/', verifyAdmin, adminBadgeController.create);
router.put('/:id', verifyAdmin, adminBadgeController.update);
router.delete('/:id', verifyAdmin, adminBadgeController.delete);

module.exports = router;