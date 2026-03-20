const achievementModel = require('../../models/achievementModel');
const badgeModel = require('../../models/badgeModel');

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

  create: async (req, res) => {
    const { name, bagde_id, bonus_xp, type,
            action_category_id, action_id,
            target_type, target_value } = req.body;
    try {
      if (!name) {
        return res.status(400).json({ message: 'Achievement name is required.' });
      }

      // Check badge exists if provided
      if (bagde_id) {
        const badge = await badgeModel.getById(bagde_id);
        if (!badge) {
          return res.status(404).json({ message: 'Badge not found.' });
        }
      }

      const achievement = await achievementModel.create({
        name, bagde_id, bonus_xp, type,
        action_category_id, action_id,
        target_type, target_value
      });
      res.status(201).json({
        message: 'Achievement created successfully.',
        data: achievement
      });
    } catch (err) {
      console.error('Create achievement error:', err);
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
      const updated = await achievementModel.update(id, req.body);
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