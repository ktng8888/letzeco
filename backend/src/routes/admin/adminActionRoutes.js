const express = require('express');
const router = express.Router();
const adminActionController = require('../../controllers/admin/adminActionController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadAction } = require('../../utils/uploadService');

router.get('/', verifyAdmin, adminActionController.getAll);
router.get('/category/:categoryId', verifyAdmin, adminActionController.getByCategory);
router.get('/:id', verifyAdmin, adminActionController.getById);
router.post('/', verifyAdmin, adminActionController.create);
router.put('/:id', verifyAdmin, adminActionController.update);
router.delete('/:id', verifyAdmin, adminActionController.delete);

router.post('/', verifyAdmin, uploadAction.single('image'), adminActionController.create);
router.put('/:id', verifyAdmin, uploadAction.single('image'), adminActionController.update);

module.exports = router;