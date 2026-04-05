const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const verifyAdmin = require('../../middleware/adminMiddleware');
const { uploadProfile } = require('../../utils/uploadService');

router.post('/login', adminAuthController.login);
router.post('/forgot-password', adminAuthController.forgotPassword);
router.post('/validate-otp', adminAuthController.validateOtp);
router.post('/reset-password', adminAuthController.resetPassword);
router.post('/logout', verifyAdmin, adminAuthController.logout);

router.get('/me', verifyAdmin, adminAuthController.getMyProfile);
router.put('/me', verifyAdmin, adminAuthController.updateMyProfile);
router.put(
  '/me/picture',
  verifyAdmin,
  uploadProfile.single('image'),
  adminAuthController.uploadMyProfilePicture
);
router.put('/me/password', verifyAdmin, adminAuthController.changeMyPassword);

module.exports = router;