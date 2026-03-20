const bcrypt = require('bcryptjs');
const userModel = require('../../models/userModel');

const adminUserController = {

  // GET ALL USERS
  getAll: async (req, res) => {
    try {
      const users = await userModel.getAll();
      res.json({
        message: 'Users retrieved successfully.',
        data: users
      });
    } catch (err) {
      console.error('Get all users error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE USER
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await userModel.getProfile(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({
        message: 'User retrieved successfully.',
        data: user
      });
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CREATE USER (admin)
  create: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Username, email and password are required.'
        });
      }

      // Check if email already exists
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          message: 'Email already registered.'
        });
      }

      // Check if username already exists
      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          message: 'Username already taken.'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await userModel.create(
        username, email, hashedPassword
      );

      res.status(201).json({
        message: 'User created successfully.',
        data: newUser
      });

    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // UPDATE USER
  update: async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    try {
      const current = await userModel.findById(id);
      if (!current) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const updated = await userModel.adminUpdate(
        id, username, email, current
      );

      res.json({
        message: 'User updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE USER
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await userModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'User not found.' });
      }

      await userModel.deleteById(id);
      res.json({ message: 'User deleted successfully.' });

    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminUserController;