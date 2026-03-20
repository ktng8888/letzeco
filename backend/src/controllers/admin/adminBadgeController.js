const badgeModel = require('../../models/badgeModel');

const adminBadgeController = {

  getAll: async (req, res) => {
    try {
      const badges = await badgeModel.getAll();
      res.json({ message: 'Badges retrieved successfully.', data: badges });
    } catch (err) {
      console.error('Get all badges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const badge = await badgeModel.getById(id);
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found.' });
      }
      res.json({ message: 'Badge retrieved successfully.', data: badge });
    } catch (err) {
      console.error('Get badge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  create: async (req, res) => {
    const { name, image } = req.body;
    try {
      if (!name) {
        return res.status(400).json({ message: 'Badge name is required.' });
      }
      const badge = await badgeModel.create(name, image);
      res.status(201).json({
        message: 'Badge created successfully.', data: badge
      });
    } catch (err) {
      console.error('Create badge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name, image } = req.body;
    try {
      const existing = await badgeModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Badge not found.' });
      }
      const updated = await badgeModel.update(
        id,
        name || existing.name,
        image || existing.image
      );
      res.json({ message: 'Badge updated successfully.', data: updated });
    } catch (err) {
      console.error('Update badge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await badgeModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Badge not found.' });
      }
      await badgeModel.delete(id);
      res.json({ message: 'Badge deleted successfully.' });
    } catch (err) {
      console.error('Delete badge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminBadgeController;