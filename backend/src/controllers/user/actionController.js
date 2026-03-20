const actionModel = require('../../models/actionModel');
const actionCategoryModel = require('../../models/actionCategoryModel');
const favouriteModel = require('../../models/favouriteModel');
const proofModel = require('../../models/proofModel');
const userActionModel = require('../../models/userActionModel');

const actionController = {

  // GET ALL ACTIONS
  getAll: async (req, res) => {
    const userId = req.user.id;
    try {
      const actions = await actionModel.getAll();

      const actionsWithDetails = await Promise.all(
        actions.map(async (action) => {
          const fav = await favouriteModel.checkExists(userId, action.id);
          return {
            ...action,
            is_favourite: fav ? true : false
          };
        })
      );

      res.json({
        message: 'Actions retrieved successfully.',
        data: actionsWithDetails
      });

    } catch (err) {
      console.error('Get all actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE ACTION
  getById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const action = await actionModel.getById(id);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      const fav = await favouriteModel.checkExists(userId, id);
      const proof = await proofModel.getByActionId(id);
      const userLogCount = await userActionModel.getUserLogCount(userId, id);
      const globalLogCount = await userActionModel.getGlobalLogCount(id);

      res.json({
        message: 'Action retrieved successfully.',
        data: {
          ...action,
          is_favourite: fav ? true : false,
          proof: proof || null,
          user_log_count: userLogCount,
          global_log_count: globalLogCount
        }
      });

    } catch (err) {
      console.error('Get action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET ACTIONS BY CATEGORY
  getByCategory: async (req, res) => {
    const { categoryId } = req.params;
    const userId = req.user.id;
    try {
      const category = await actionCategoryModel.getById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      const actions = await actionModel.getByCategory(categoryId);

      const actionsWithDetails = await Promise.all(
        actions.map(async (action) => {
          const fav = await favouriteModel.checkExists(userId, action.id);
          const userLogCount = await userActionModel.getUserLogCount(
            userId, action.id
          );
          const inProgress = await userActionModel.getInProgress(
            userId, action.id
          );

          return {
            ...action,
            is_favourite: fav ? true : false,
            user_log_count: userLogCount,
            is_logging: inProgress ? true : false
          };
        })
      );

      res.json({
        message: 'Actions retrieved successfully.',
        data: {
          category,
          actions: actionsWithDetails,
          total_logged_today: actionsWithDetails.filter(
            a => a.is_logging
          ).length
        }
      });

    } catch (err) {
      console.error('Get actions by category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET TOP 5 POPULAR ACTIONS
  getPopular: async (req, res) => {
    const userId = req.user.id;
    try {
      const actions = await actionModel.getPopular();

      const actionsWithDetails = await Promise.all(
        actions.map(async (action) => {
          const fav = await favouriteModel.checkExists(userId, action.id);
          const userLogCount = await userActionModel.getUserLogCount(
            userId, action.id
          );

          return {
            ...action,
            is_favourite: fav ? true : false,
            user_log_count: userLogCount,
            global_log_count: parseInt(action.global_log_count)
          };
        })
      );

      res.json({
        message: 'Popular actions retrieved successfully.',
        data: actionsWithDetails
      });

    } catch (err) {
      console.error('Get popular actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET RECOMMENDED ACTIONS
  getRecommended: async (req, res) => {
    const userId = req.user.id;
    try {
      const actions = await actionModel.getRecommended(userId);

      const actionsWithDetails = await Promise.all(
        actions.map(async (action) => {
          const fav = await favouriteModel.checkExists(userId, action.id);
          return {
            ...action,
            is_favourite: fav ? true : false,
            user_log_count: 0
          };
        })
      );

      res.json({
        message: 'Recommended actions retrieved successfully.',
        data: actionsWithDetails
      });

    } catch (err) {
      console.error('Get recommended actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = actionController;