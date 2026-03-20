const actionCategoryModel = require('../../models/actionCategoryModel');

const adminActionCategoryController = {

  // GET ALL CATEGORIES
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

  // CREATE CATEGORY
  create: async (req, res) => {
    const { name, image } = req.body;
    try {
      if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
      }
      const category = await actionCategoryModel.create(name, image || null);
      res.status(201).json({
        message: 'Category created successfully.',
        data: category
      });
    } catch (err) {
      console.error('Create category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // UPDATE CATEGORY
  update: async (req, res) => {
    const { id } = req.params;
    const { name, image } = req.body;
    try {
      const existing = await actionCategoryModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      const updated = await actionCategoryModel.update(
        id,
        name || existing.name,
        image || existing.image
      );
      res.json({
        message: 'Category updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE CATEGORY
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await actionCategoryModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      await actionCategoryModel.delete(id);
      res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
      console.error('Delete category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminActionCategoryController;