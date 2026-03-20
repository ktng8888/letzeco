const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const verifyToken = require('../../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/validate-otp', authController.validateOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;