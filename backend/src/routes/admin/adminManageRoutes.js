const express = require('express');
const router = express.Router();
const adminManageController = require('../../controllers/admin/adminManageController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadProfile } = require('../../utils/uploadService');

router.get('/', verifyAdmin, adminManageController.getAll);
router.get('/:id', verifyAdmin, adminManageController.getById);
router.post('/', verifyAdmin, adminManageController.create);
router.put('/:id', verifyAdmin, adminManageController.update);
router.put(
  '/:id/picture',
  verifyAdmin,
  uploadProfile.single('image'),
  adminManageController.uploadProfilePicture
);
router.delete('/:id', verifyAdmin, adminManageController.delete);

module.exports = router;