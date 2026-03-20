const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.post('/login', adminAuthController.login);
router.post('/forgot-password', adminAuthController.forgotPassword);
router.post('/validate-otp', adminAuthController.validateOtp);
router.post('/reset-password', adminAuthController.resetPassword);
router.post('/logout', verifyAdmin, adminAuthController.logout);

module.exports = router;