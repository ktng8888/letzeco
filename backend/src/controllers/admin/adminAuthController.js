const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../../models/adminModel');
const { sendOtpEmail } = require('../../utils/emailService');

const adminAuthController = {

  // ADMIN LOGIN
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find admin
      const admin = await adminModel.findByEmail(email);
      if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Generate token with role: admin
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Admin login successful!',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        }
      });

    } catch (err) {
      console.error('Admin login error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // FORGOT PASSWORD - Send OTP
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const admin = await adminModel.findByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP to database
      await adminModel.saveOtp(email, otp);

      // Send OTP email
      await sendOtpEmail(email, otp);

      res.json({ message: 'OTP sent to your email.' });

    } catch (err) {
      console.error('Admin forgot password error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // VALIDATE OTP
  validateOtp: async (req, res) => {
    const { email, otp } = req.body;

    try {
      const admin = await adminModel.findByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      if (admin.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      // Check OTP not expired
      if (!admin.otp_expires_at || new Date() > new Date(admin.otp_expires_at)) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.'
        });
      }

      res.json({ message: 'OTP validated successfully.' });

    } catch (err) {
      console.error('Admin validate OTP error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // RESET PASSWORD
  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      const admin = await adminModel.findByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      if (admin.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      // Check OTP not expired
      if (!admin.otp_expires_at || new Date() > new Date(admin.otp_expires_at)) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP
      await adminModel.updatePassword(email, hashedPassword);
      await adminModel.clearOtp(email);

      res.json({ message: 'Password reset successful!' });

    } catch (err) {
      console.error('Admin reset password error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

    // LOGOUT
    logout: async (req, res) => {
    try {
        res.json({ message: 'Admin logged out successfully.' });
    } catch (err) {
        console.error('Admin logout error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
    },

};

module.exports = adminAuthController;