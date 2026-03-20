const express = require('express');
const router = express.Router();
const adminActionCategoryController = require('../../controllers/admin/adminActionCategoryController');
const verifyAdmin = require('../../middleware/adminMiddleware');

// All routes protected by admin middleware
router.get('/', verifyAdmin, adminActionCategoryController.getAll);
router.get('/:id', verifyAdmin, adminActionCategoryController.getById);
router.post('/', verifyAdmin, adminActionCategoryController.create);
router.put('/:id', verifyAdmin, adminActionCategoryController.update);
router.delete('/:id', verifyAdmin, adminActionCategoryController.delete);

module.exports = router;