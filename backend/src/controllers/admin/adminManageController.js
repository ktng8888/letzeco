const bcrypt = require('bcryptjs');
const adminModel = require('../../models/adminModel');
const { uploadProfile } = require('../../utils/uploadService');

const adminManageController = {

  // GET ALL ADMINS
  getAll: async (req, res) => {
    try {
      const admins = await adminModel.getAll();
      res.json({
        message: 'Admins retrieved successfully.',
        data: admins
      });
    } catch (err) {
      console.error('Get all admins error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE ADMIN
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const admin = await adminModel.getProfile(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found.' });
      }
      res.json({
        message: 'Admin retrieved successfully.',
        data: admin
      });
    } catch (err) {
      console.error('Get admin error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CREATE ADMIN
  create: async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Username, email and password are required.'
        });
      }

      // Check email exists
      const existingEmail = await adminModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          message: 'Email already registered.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await adminModel.create(
        username, email, hashedPassword
      );

      res.status(201).json({
        message: 'Admin created successfully.',
        data: admin
      });

    } catch (err) {
      console.error('Create admin error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // UPDATE ADMIN
  update: async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    try {
      const current = await adminModel.findById(id);
      if (!current) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      const updated = await adminModel.update(
        id, username, email, current
      );

      res.json({
        message: 'Admin updated successfully.',
        data: updated
      });

    } catch (err) {
      console.error('Update admin error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // UPLOAD ADMIN PROFILE PICTURE
  uploadProfilePicture: async (req, res) => {
    const { id } = req.params;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded.' });
      }

      const existing = await adminModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      const imagePath = req.file.path.replace(/\\/g, '/');
      const updated = await adminModel.updateProfileImage(id, imagePath);

      res.json({
        message: 'Profile picture updated successfully.',
        data: { profile_image: updated.profile_image }
      });

    } catch (err) {
      console.error('Upload admin profile picture error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE ADMIN
  delete: async (req, res) => {
    const { id } = req.params;
    const requestingAdminId = req.admin.id;
    try {
      // Cannot delete yourself
      if (parseInt(id) === requestingAdminId) {
        return res.status(400).json({
          message: 'You cannot delete your own account.'
        });
      }

      const existing = await adminModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      await adminModel.deleteById(id);
      res.json({ message: 'Admin deleted successfully.' });

    } catch (err) {
      console.error('Delete admin error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminManageController;