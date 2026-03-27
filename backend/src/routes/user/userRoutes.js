const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const verifyToken = require('../../middleware/authMiddleware');
const { uploadProfile } = require('../../utils/uploadService');

// All routes require login
router.get('/profile', verifyToken, userController.getProfile);
router.get('/:id/profile', verifyToken, userController.getUserProfile);
router.get('/profile/:id', verifyToken, userController.getUserById);
router.put('/profile/username', verifyToken, userController.updateUsername);
router.put('/profile/email', verifyToken, userController.updateEmail);
router.put('/profile/picture', verifyToken,
  uploadProfile.single('image'),
  userController.uploadProfilePicture
);
router.put('/password', verifyToken, userController.changePassword);

module.exports = router;