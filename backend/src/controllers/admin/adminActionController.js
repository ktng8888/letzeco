const actionModel = require('../../models/actionModel');
const actionCategoryModel = require('../../models/actionCategoryModel');
const proofModel = require('../../models/proofModel');
const { deleteFile } = require('../../utils/uploadService');
const { normalizeTimeLimit } = require('../../utils/timeLimit');

const adminActionController = {

  // GET ALL ACTIONS
  getAll: async (req, res) => {
    try {
      const actions = await actionModel.getAll();
      res.json({
        message: 'Actions retrieved successfully.',
        data: actions
      });
    } catch (err) {
      console.error('Get all actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE ACTION
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const action = await actionModel.getById(id);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }
      /*
      res.json({
        message: 'Action retrieved successfully.',
        data: action
      });
      */
      const proof = await proofModel.getByActionId(id); // NEW
      res.json({ message: 'Action retrieved successfully.', data: { ...action, proof: proof || null } });
    } catch (err) {
      console.error('Get action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET ACTIONS BY CATEGORY
  getByCategory: async (req, res) => {
    const { categoryId } = req.params;
    try {
      const actions = await actionModel.getByCategory(categoryId);
      res.json({
        message: 'Actions retrieved successfully.',
        data: actions
      });
    } catch (err) {
      console.error('Get actions by category error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  /*
  create: async (req, res) => {
    const {
      name, action_category_id, time_limit,
      description, importance, xp_reward,
      co2_saved, litre_saved, kwh_saved,
      calc_info, source
    } = req.body;

    const image = req.file
      ? req.file.path.replace(/\\/g, '/')
      : null;

    try {
      if (!name || !action_category_id) {
        return res.status(400).json({
          message: 'Name and category are required.'
        });
      }
      const category = await actionCategoryModel.getById(action_category_id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      const normalizedTimeLimit = normalizeTimeLimit(time_limit);
      const action = await actionModel.create({
        name, action_category_id, image,
        time_limit: normalizedTimeLimit, description, importance,
        xp_reward, co2_saved, litre_saved,
        kwh_saved, calc_info, source
      });
      res.status(201).json({
        message: 'Action created successfully.',
        data: action
      });
    } catch (err) {
      console.error('Create action error:', err);
      if (err.statusCode === 400) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await actionModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      const image = req.file
        ? req.file.path.replace(/\\/g, '/')
        : undefined;
  
      const removeImage = req.body.remove_image === 'true';
      if ((image || removeImage) && existing.image) {
        deleteFile(existing.image);
      }

      const payload = {
        ...req.body,
        ...(image !== undefined && { image })
      };

      if (Object.prototype.hasOwnProperty.call(payload, 'time_limit')) {
        payload.time_limit = normalizeTimeLimit(payload.time_limit);
      }

      const updated = await actionModel.update(id, payload);
      res.json({
        message: 'Action updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update action error:', err);
      if (err.statusCode === 400) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: 'Server error.' });
    }
  },
  */

  // In create(), after the action is created, add:
  create: async (req, res) => {
    const {
      name, action_category_id, time_limit,
      description, importance, xp_reward,
      co2_saved, litre_saved, kwh_saved,
      calc_info, source,
      // NEW:
      proof_required, proof_type, proof_bonus_xp, proof_requirement
    } = req.body;

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

    try {
      if (!name || !action_category_id) {
        return res.status(400).json({ message: 'Name and category are required.' });
      }
      const category = await actionCategoryModel.getById(action_category_id);
      if (!category) return res.status(404).json({ message: 'Category not found.' });

      const action = await actionModel.create({
        name, action_category_id, image,
        time_limit, description, importance,
        xp_reward, co2_saved, litre_saved,
        kwh_saved, calc_info, source
      });

      // NEW: Save proof if required
      if (proof_required === 'true' && proof_type && proof_bonus_xp) {
        await proofModel.create(
          action.id,
          proof_requirement || '',
          parseInt(proof_bonus_xp),
          proof_type
        );
      }

      res.status(201).json({ message: 'Action created successfully.', data: action });
    } catch (err) {
      console.error('Create action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // In update(), after actionModel.update(), add:
  update: async (req, res) => {
    const { id } = req.params;
    const {
      proof_required, proof_type, proof_bonus_xp, proof_requirement
    } = req.body;

    try {
      const existing = await actionModel.getById(id);
      if (!existing) return res.status(404).json({ message: 'Action not found.' });

      const image = req.file ? req.file.path.replace(/\\/g, '/') : undefined;
      const removeImage = req.body.remove_image === 'true';
      if ((image || removeImage) && existing.image) deleteFile(existing.image);

      const updated = await actionModel.update(id, {
        ...req.body,
        ...(image !== undefined && { image })
      });

      // NEW: Handle proof upsert/delete
      const existingProof = await proofModel.getByActionId(id);
      if (proof_required === 'true' && proof_type && proof_bonus_xp) {
        if (existingProof) {
          await proofModel.update(id, proof_requirement || '', parseInt(proof_bonus_xp), proof_type);
        } else {
          await proofModel.create(id, proof_requirement || '', parseInt(proof_bonus_xp), proof_type);
        }
      } else if (proof_required !== 'true' && existingProof) {
        // Proof was turned off — delete it
        await proofModel.deleteByActionId(id);
      }

      res.json({ message: 'Action updated successfully.', data: updated });
    } catch (err) {
      console.error('Update action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE ACTION
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await actionModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Action not found.' });
      }
      await actionModel.delete(id);

      if (existing.image) {
        deleteFile(existing.image);
      }

      res.json({ message: 'Action deleted successfully.' });
    } catch (err) {
      console.error('Delete action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminActionController;
