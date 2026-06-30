const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../../models/userModel');
const { sendOtpEmail } = require('../../utils/emailService');
const streakService = require('../../utils/streakService');
const weeklyXpService = require('../../utils/weeklyXpService');

const authController = {

  // REGISTER
  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Check if email exists
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered.' });
      }

      // Check if username exists
      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await userModel.create(username, email, hashedPassword);

      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful!',
        token,
        user: newUser
      });

    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // LOGIN
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      await streakService.checkAndResetStreak(user.id);
      await weeklyXpService.syncWeeklyXp();
      const freshUser = await userModel.findById(user.id);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful!',
        token,
        user: {
          id: freshUser.id,
          username: freshUser.username,
          email: freshUser.email,
          level: freshUser.level,
          level_xp: freshUser.level_xp,
          total_xp: freshUser.total_xp,
          weekly_xp: freshUser.weekly_xp,
          best_weekly_xp: freshUser.best_weekly_xp,
          streak: freshUser.streak,
          profile_image: freshUser.profile_image
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // FORGOT PASSWORD - Send OTP
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP to database
      await userModel.saveOtp(email, otp);

      // Send OTP email
      await sendOtpEmail(email, otp);

      res.json({ message: 'OTP sent to your email.' });

    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // VALIDATE OTP
  validateOtp: async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      // Check OTP matches
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      // Check OTP not expired
      if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.'
        });
      }

      res.json({ message: 'OTP validated successfully.' });

    } catch (err) {
      console.error('Validate OTP error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // RESET PASSWORD
  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Email not found.' });
      }

      // Check OTP matches
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      // Check OTP not expired
      if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updatePassword(email, hashedPassword);
      await userModel.clearOtp(email);

      res.json({ message: 'Password reset successful!' });

    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

    // LOGOUT
  logout: async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully.' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = authController;
