const express = require('express');
const router = express.Router();
const adminActionCategoryController = require('../../controllers/admin/adminActionCategoryController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadCategory } = require('../../utils/uploadService');

// All routes protected by admin middleware
router.get('/', verifyAdmin, adminActionCategoryController.getAll);
router.get('/:id', verifyAdmin, adminActionCategoryController.getById);
router.post('/', verifyAdmin, adminActionCategoryController.create);
router.put('/:id', verifyAdmin, adminActionCategoryController.update);
router.delete('/:id', verifyAdmin, adminActionCategoryController.delete);

router.post('/', verifyAdmin, uploadCategory.single('image'), adminActionCategoryController.create);
router.put('/:id', verifyAdmin, uploadCategory.single('image'), adminActionCategoryController.update);

module.exports = router;