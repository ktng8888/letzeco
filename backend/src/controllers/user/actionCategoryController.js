const actionCategoryModel = require('../../models/actionCategoryModel');
const actionModel = require('../../models/actionModel');
const favouriteModel = require('../../models/favouriteModel');

const actionCategoryController = {

  // GET ALL CATEGORIES with action count
  getAll: async (req, res) => {
    try {
      const categories = await actionCategoryModel.getAll();

      // Add action count to each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const actions = await actionModel.getByCategory(cat.id);
          return {
            ...cat,
            action_count: actions.length
          };
        })
      );

      res.json({
        message: 'Categories retrieved successfully.',
        data: categoriesWithCount
      });

    } catch (err) {
      console.error('Get all categories error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE CATEGORY
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await actionCategoryModel.getById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      res.json({
        message: 'Category retrieved successfully.',
        data: category
      });
    } catch (err) {
      console.error('Get category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = actionCategoryController;