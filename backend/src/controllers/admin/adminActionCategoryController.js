const actionCategoryModel = require('../../models/actionCategoryModel');
const { deleteFile } = require('../../utils/uploadService');

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

  create: async (req, res) => {
    const {
      name, description,
      tag_bg_colour_code, tag_text_colour_code
    } = req.body;

    // Get uploaded image path if any
    const image = req.file
      ? req.file.path.replace(/\\/g, '/')
      : null;

    try {
      if (!name) {
        return res.status(400).json({ message: 'Name is required.' });
      }
      const category = await actionCategoryModel.create({
        name, description,
        tag_bg_colour_code, tag_text_colour_code,
        image
      });
      res.status(201).json({
        message: 'Category created successfully.',
        data: category
      });
    } catch (err) {
      console.error('Create category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await actionCategoryModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      // Get new image if uploaded, else keep existing
      const image = req.file
        ? req.file.path.replace(/\\/g, '/')
        : undefined;

      const removeImage = req.body.remove_image === 'true';
      if ((image || removeImage) && existing.image) {
        deleteFile(existing.image);
      }

      const updated = await actionCategoryModel.update(id, {
        ...req.body,
        ...(image !== undefined && { image })
      });
      res.json({
        message: 'Category updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

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