const actionCategoryModel = require('../../models/actionCategoryModel');

const actionCategoryController = {

  // GET ALL CATEGORIES with action count
  getAll: async (req, res) => {
    try {
      const categories = await actionCategoryModel.getAll();

      res.json({
        message: 'Categories retrieved successfully.',
        data: categories
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
