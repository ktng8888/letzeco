// backend/src/controllers/admin/adminChallengeController.js
const challengeModel       = require('../../models/challengeModel');
const eligibleActionModel  = require('../../models/eligibleActionModel');
const actionModel          = require('../../models/actionModel');
const userChallengeModel   = require('../../models/userChallengeModel');
const teamMemberModel      = require('../../models/teamMemberModel');
const teamModel            = require('../../models/teamModel');
const challengeRewardModel = require('../../models/challengeRewardModel');
const badgeModel           = require('../../models/badgeModel');
const { deleteFile }       = require('../../utils/uploadService');

const adminChallengeController = {

  getAll: async (req, res) => {
    try {
      const challenges = await challengeModel.getAll();
      res.json({ message: 'Challenges retrieved successfully.', data: challenges });
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
      const eligibleActions = await eligibleActionModel.getByChallengeId(id);
      const rewards         = await challengeRewardModel.getByChallengeId(id);
      res.json({
        message: 'Challenge retrieved successfully.',
        data: { ...challenge, eligible_actions: eligibleActions, rewards }
      });
    } catch (err) {
      console.error('Get challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  create: async (req, res) => {
    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    try {
      if (!req.body.name || !req.body.start_date || !req.body.end_date) {
        return res.status(400).json({
          message: 'Name, start date and end date are required.'
        });
      }
      const challenge = await challengeModel.create({ ...req.body, image });
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

      const image       = req.file ? req.file.path.replace(/\\/g, '/') : undefined;
      const removeImage = req.body.remove_image === 'true';

      if ((image || removeImage) && existing.image) {
        deleteFile(existing.image);
      }

      const updated = await challengeModel.update(id, {
        ...req.body,
        ...(image !== undefined && { image }),
        ...(removeImage && { remove_image: 'true' })
      });
      res.json({ message: 'Challenge updated successfully.', data: updated });
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

      await userChallengeModel.deleteByChallengeId(id);

      const teams = await teamModel.getByChallenge(id);
      for (const team of teams) {
        await teamMemberModel.deleteByTeamId(team.id);
      }
      await teamModel.deleteByChallengeId(id);
      await eligibleActionModel.deleteByChallengeId(id);
      await challengeRewardModel.deleteByChallengeId(id);
      await challengeModel.delete(id);

      if (existing.image) deleteFile(existing.image);

      res.json({ message: 'Challenge deleted successfully.' });
    } catch (err) {
      console.error('Delete challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // ── NEW: Save one reward row for a challenge
  // POST /api/admin/challenges/:id/rewards
  saveReward: async (req, res) => {
    const { id } = req.params; // challenge_id
    const { type, top_value, xp_reward, badge_name } = req.body;

    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      // Create badge if badge_name is provided (with or without image)
      let badgeId = null;
      if (badge_name) {
        const badgeImage = req.file
          ? req.file.path.replace(/\\/g, '/')
          : null;
        const badge = await badgeModel.create({
          name:  badge_name,
          image: badgeImage,
        });
        badgeId = badge.id;
      }

      const reward = await challengeRewardModel.create({
        challengeId: id,
        badgeId,
        type,
        topValue:  top_value  || null,
        xpReward:  xp_reward  || 0,
      });

      res.status(201).json({ message: 'Reward saved.', data: reward });
    } catch (err) {
      console.error('Save reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // ── NEW: Delete all rewards for a challenge (called before re-saving on update)
  // DELETE /api/admin/challenges/:id/rewards
  deleteRewards: async (req, res) => {
    const { id } = req.params;
    try {
      await challengeRewardModel.deleteByChallengeId(id);
      res.json({ message: 'Rewards deleted.' });
    } catch (err) {
      console.error('Delete rewards error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  addEligibleAction: async (req, res) => {
    const { id } = req.params;
    const { action_id } = req.body;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
      const action = await actionModel.getById(action_id);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }
      const alreadyExists = await eligibleActionModel.checkExists(action_id, id);
      if (alreadyExists) {
        return res.status(400).json({ message: 'Action already added to this challenge.' });
      }
      const eligible = await eligibleActionModel.create(action_id, id);
      res.status(201).json({ message: 'Eligible action added successfully.', data: eligible });
    } catch (err) {
      console.error('Add eligible action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

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

  getEligibleActions: async (req, res) => {
    const { id } = req.params;
    try {
      const actions = await eligibleActionModel.getByChallengeId(id);
      res.json({ message: 'Eligible actions retrieved successfully.', data: actions });
    } catch (err) {
      console.error('Get eligible actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminChallengeController;