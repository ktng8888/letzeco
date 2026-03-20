const challengeModel = require('../../models/challengeModel');
const eligibleActionModel = require('../../models/eligibleActionModel');
const actionModel = require('../../models/actionModel');

const adminChallengeController = {

  getAll: async (req, res) => {
    try {
      const challenges = await challengeModel.getAll();
      res.json({
        message: 'Challenges retrieved successfully.',
        data: challenges
      });
    } catch (err) {
      console.error('Get all challenges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
      // Also get eligible actions
      const eligibleActions = await eligibleActionModel.getByChallengeId(id);
      res.json({
        message: 'Challenge retrieved successfully.',
        data: { ...challenge, eligible_actions: eligibleActions }
      });
    } catch (err) {
      console.error('Get challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  create: async (req, res) => {
    const { name, image, type, start_date, end_date,
            about, target_type, target_value, status } = req.body;
    try {
      if (!name || !start_date || !end_date) {
        return res.status(400).json({
          message: 'Name, start date and end date are required.'
        });
      }
      const challenge = await challengeModel.create({
        name, image, type, start_date, end_date,
        about, target_type, target_value, status
      });
      res.status(201).json({
        message: 'Challenge created successfully.',
        data: challenge
      });
    } catch (err) {
      console.error('Create challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await challengeModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
      const updated = await challengeModel.update(id, req.body);
      res.json({
        message: 'Challenge updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('Update challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await challengeModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
      await challengeModel.delete(id);
      res.json({ message: 'Challenge deleted successfully.' });
    } catch (err) {
      console.error('Delete challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // ADD ELIGIBLE ACTION TO CHALLENGE
  addEligibleAction: async (req, res) => {
    const { id } = req.params; // challenge id
    const { action_id } = req.body;
    try {
      // Check challenge exists
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      // Check action exists
      const action = await actionModel.getById(action_id);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      // Check if already added
      const alreadyExists = await eligibleActionModel.checkExists(action_id, id);
      if (alreadyExists) {
        return res.status(400).json({
          message: 'Action already added to this challenge.'
        });
      }

      const eligible = await eligibleActionModel.create(action_id, id);
      res.status(201).json({
        message: 'Eligible action added successfully.',
        data: eligible
      });
    } catch (err) {
      console.error('Add eligible action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // REMOVE ELIGIBLE ACTION FROM CHALLENGE
  removeEligibleAction: async (req, res) => {
    const { eligibleActionId } = req.params;
    try {
      await eligibleActionModel.delete(eligibleActionId);
      res.json({ message: 'Eligible action removed successfully.' });
    } catch (err) {
      console.error('Remove eligible action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET ELIGIBLE ACTIONS FOR CHALLENGE
  getEligibleActions: async (req, res) => {
    const { id } = req.params;
    try {
      const actions = await eligibleActionModel.getByChallengeId(id);
      res.json({
        message: 'Eligible actions retrieved successfully.',
        data: actions
      });
    } catch (err) {
      console.error('Get eligible actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminChallengeController;