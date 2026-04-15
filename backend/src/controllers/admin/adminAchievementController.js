const achievementModel = require('../../models/achievementModel');
const badgeModel = require('../../models/badgeModel');
const { uploadBadge } = require('../../utils/uploadService');
const { deleteFile } = require('../../utils/uploadService'); 
const multer = require('multer');

const adminAchievementController = {

  getAll: async (req, res) => {
    try {
      const achievements = await achievementModel.getAll();
      res.json({
        message: 'Achievements retrieved successfully.',
        data: achievements
      });
    } catch (err) {
      console.error('Get all achievements error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const achievement = await achievementModel.getById(id);
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found.' });
      }
      res.json({
        message: 'Achievement retrieved successfully.',
        data: achievement
      });
    } catch (err) {
      console.error('Get achievement error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CREATE MULTIPLE ACHIEVEMENTS AT ONCE
  // Receives: type, action_category_id
  // + rows[]: { target_value, bonus_xp, name, badge_name }
  // + images[]: files named image_0, image_1, image_2...
  createBatch: async (req, res) => {
    try {
      const { type, action_category_id } = req.body;

      if (!type) {
        return res.status(400).json({
          message: 'Achievement type is required.'
        });
      }

      // Parse rows from JSON string
      let rows = [];
      try {
        rows = JSON.parse(req.body.rows || '[]');
      } catch {
        return res.status(400).json({ message: 'Invalid rows data.' });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: 'At least one achievement row is required.'
        });
      }

      // Validate rows
      for (const row of rows) {
        if (!row.target_value || !row.bonus_xp || !row.name || !row.badge_name) {
          return res.status(400).json({
            message: 'Each row needs target value, bonus XP, achievement name and badge name.'
          });
        }
      }

      // Get uploaded files — keyed by image_0, image_1, etc.
      const files = req.files || {};

      const created = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Get badge image for this row
        const imageFile = files[`image_${i}`]?.[0];
        const imagePath = imageFile
          ? imageFile.path.replace(/\\/g, '/')
          : null;

        // Create badge first
        const badge = await badgeModel.create({
          name: row.badge_name,
          image: imagePath,
        });

        // Create achievement linked to badge
        const achievement = await achievementModel.create({
          name: row.name,
          type,
          target_value: parseInt(row.target_value),
          bonus_xp: parseInt(row.bonus_xp),
          badge_name: row.badge_name,
          bagde_id: badge.id,
          action_category_id: action_category_id || null,
        });

        created.push(achievement);
      }

      res.status(201).json({
        message: `${created.length} achievement(s) created successfully.`,
        data: created
      });

    } catch (err) {
      console.error('Create batch achievements error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;

    try {
      const existing = await achievementModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Achievement not found.' });
      }

      const imageFile = req.files?.['image']?.[0];
      const imagePath = imageFile
        ? imageFile.path.replace(/\\/g, '/')
        : undefined;

      // support remove image
      const removeImage = req.body.remove_image === 'true';

      if (existing.bagde_id) {
        // Get existing badge
        const existingBadge = await badgeModel.getById(existing.bagde_id);

        // DELETE old image (covers upload + remove)
        if ((imagePath || removeImage) && existingBadge?.image) {
          try {
            deleteFile(existingBadge.image);
          } catch (err) {
            console.warn('Failed to delete old badge image:', err);
          }
        }

        await badgeModel.update(existing.bagde_id, {
          name: req.body.badge_name || existing.badge_name,
          ...(imagePath !== undefined && { image: imagePath }),
          ...(removeImage && { image: null }),
        });
      }

      const updated = await achievementModel.update(id, {
        ...req.body,
        target_value: parseInt(req.body.target_value),
        bonus_xp: parseInt(req.body.bonus_xp),
      });

      res.json({
        message: 'Achievement updated successfully.',
        data: updated
      });

    } catch (err) {
      console.error('Update achievement error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await achievementModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Achievement not found.' });
      }
      await achievementModel.delete(id);
      res.json({ message: 'Achievement deleted successfully.' });
    } catch (err) {
      console.error('Delete achievement error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminAchievementController;