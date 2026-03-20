const favouriteModel = require('../../models/favouriteModel');
const actionModel = require('../../models/actionModel');

const favouriteController = {

  // GET MY FAVOURITES
  getAll: async (req, res) => {
    const userId = req.user.id;
    try {
      const favourites = await favouriteModel.getByUserId(userId);
      res.json({
        message: 'Favourites retrieved successfully.',
        data: favourites
      });
    } catch (err) {
      console.error('Get favourites error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // ADD TO FAVOURITES
  add: async (req, res) => {
    const userId = req.user.id;
    const { actionId } = req.params;
    try {
      // Check action exists
      const action = await actionModel.getById(actionId);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      // Check if already favourited
      const existing = await favouriteModel.checkExists(userId, actionId);
      if (existing) {
        return res.status(400).json({
          message: 'Action already in favourites.'
        });
      }

      await favouriteModel.create(userId, actionId);

      res.status(201).json({
        message: 'Action added to favourites.'
      });

    } catch (err) {
      console.error('Add favourite error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // REMOVE FROM FAVOURITES
  remove: async (req, res) => {
    const userId = req.user.id;
    const { actionId } = req.params;
    try {
      // Check if favourited
      const existing = await favouriteModel.checkExists(userId, actionId);
      if (!existing) {
        return res.status(404).json({
          message: 'Action not in favourites.'
        });
      }

      await favouriteModel.delete(userId, actionId);

      res.json({ message: 'Action removed from favourites.' });

    } catch (err) {
      console.error('Remove favourite error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = favouriteController;