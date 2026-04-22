const streakRewardModel = require('../../models/streakRewardModel');
const badgeModel = require('../../models/badgeModel');

const adminStreakRewardController = {

  getAll: async (req, res) => {
    try {
      const rewards = await streakRewardModel.getAll();
      res.json({
        message: 'Streak rewards retrieved successfully.',
        data: rewards
      });
    } catch (err) {
      console.error('Get all streak rewards error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const reward = await streakRewardModel.getById(id);
      if (!reward) {
        return res.status(404).json({ message: 'Streak reward not found.' });
      }
      res.json({
        message: 'Streak reward retrieved successfully.',
        data: reward
      });
    } catch (err) {
      console.error('Get streak reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  create: async (req, res) => {
    const { badge_id, day, xp_reward } = req.body;
    try {
      if (!day) {
        return res.status(400).json({ message: 'Day is required.' });
      }

      // Check badge exists if provided
      if (badge_id) {
        const badge = await badgeModel.getById(badge_id);
        if (!badge) {
          return res.status(404).json({ message: 'Badge not found.' });
        }
      }

      // Check if day already exists
      const existing = await streakRewardModel.getByDay(day);
      if (existing) {
        return res.status(400).json({
          message: `Streak reward for day ${day} already exists.`
        });
      }

      const reward = await streakRewardModel.create(badge_id, day, xp_reward);
      res.status(201).json({
        message: 'Streak reward created successfully.',
        data: reward
      });
    } catch (err) {
      console.error('Create streak reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await streakRewardModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Streak reward not found.' });
      }
      const updated = await streakRewardModel.update(id, req.body);
      res.json({
        message: 'Streak reward updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update streak reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await streakRewardModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Streak reward not found.' });
      }
      await streakRewardModel.delete(id);
      res.json({ message: 'Streak reward deleted successfully.' });
    } catch (err) {
      console.error('Delete streak reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminStreakRewardController;