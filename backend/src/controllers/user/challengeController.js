const challengeModel = require('../../models/challengeModel');
const userChallengeModel = require('../../models/userChallengeModel');
const eligibleActionModel = require('../../models/eligibleActionModel');
const challengeRewardModel = require('../../models/challengeRewardModel');
const userChallengeRewardModel = require('../../models/userChallengeRewardModel');
const teamModel = require('../../models/teamModel');
const teamMemberModel = require('../../models/teamMemberModel');
const xpService = require('../../utils/xpService');

const challengeController = {

  // GET ALL AVAILABLE CHALLENGES
  getAll: async (req, res) => {
    const userId = req.user.id;
    try {
      const challenges = await challengeModel.getAll();

      const challengesWithDetails = await Promise.all(
        challenges.map(async (challenge) => {
          // Check if user is participating
          const participating = await userChallengeModel
            .getByUserAndChallenge(userId, challenge.id);

          // Get eligible actions
          const eligibleActions = await eligibleActionModel
            .getByChallengeId(challenge.id);

          // Get participants count
          const participantsCount = await userChallengeModel
            .getParticipantsCount(challenge.id);

          // Get rewards
          const rewards = await challengeRewardModel
            .getByChallengeId(challenge.id);

          return {
            ...challenge,
            is_participating: participating ? true : false,
            progress_value: participating
              ? participating.progress_value : 0,
            eligible_actions: eligibleActions,
            participants_count: participantsCount,
            rewards
          };
        })
      );

      res.json({
        message: 'Challenges retrieved successfully.',
        data: challengesWithDetails
      });

    } catch (err) {
      console.error('Get all challenges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE CHALLENGE
  getById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      const participating = await userChallengeModel
        .getByUserAndChallenge(userId, id);

      const eligibleActions = await eligibleActionModel
        .getByChallengeId(id);

      const rewards = await challengeRewardModel
        .getByChallengeId(id);

      const participantsCount = await userChallengeModel
        .getParticipantsCount(id);

      // Get team details if team challenge and user is participating
      let teamDetails = null;
      if (challenge.type === 'team' && participating && participating.team_id) {
        const team = await teamModel.getById(participating.team_id);
        const members = await teamMemberModel.getByTeamId(
          participating.team_id
        );
        const memberCount = await teamModel.getMemberCount(
          participating.team_id
        );
        const teamProgress = await userChallengeModel.getTeamProgress(
          participating.team_id, id
        );

        teamDetails = {
          ...team,
          members,
          member_count: memberCount,
          team_progress: teamProgress
        };
      }

      res.json({
        message: 'Challenge retrieved successfully.',
        data: {
          ...challenge,
          is_participating: participating ? true : false,
          progress_value: participating
            ? participating.progress_value : 0,
          eligible_actions: eligibleActions,
          participants_count: participantsCount,
          rewards,
          team: teamDetails
        }
      });

    } catch (err) {
      console.error('Get challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET MY CHALLENGES
  getMyChallenges: async (req, res) => {
    const userId = req.user.id;
    try {
      const challenges = await userChallengeModel.getMyChallenge(userId);

      const challengesWithDetails = await Promise.all(
        challenges.map(async (uc) => {
          const rewards = await challengeRewardModel
            .getByChallengeId(uc.challenge_id);

          let teamDetails = null;
          if (uc.type === 'team' && uc.team_id) {
            const team = await teamModel.getById(uc.team_id);
            const memberCount = await teamModel.getMemberCount(uc.team_id);
            const teamProgress = await userChallengeModel.getTeamProgress(
              uc.team_id, uc.challenge_id
            );
            teamDetails = {
              ...team,
              member_count: memberCount,
              team_progress: teamProgress
            };
          }

          return {
            ...uc,
            rewards,
            team: teamDetails
          };
        })
      );

      res.json({
        message: 'My challenges retrieved successfully.',
        data: challengesWithDetails
      });

    } catch (err) {
      console.error('Get my challenges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // JOIN SOLO CHALLENGE
  joinSolo: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      if (challenge.type !== 'solo') {
        return res.status(400).json({
          message: 'This is a team challenge. Please join or create a team.'
        });
      }

      // Check if already participating
      const existing = await userChallengeModel
        .getByUserAndChallenge(userId, id);
      if (existing) {
        return res.status(400).json({
          message: 'Already participating in this challenge.'
        });
      }

      const userChallenge = await userChallengeModel.create(
        userId, id, null
      );

      res.status(201).json({
        message: 'Successfully joined challenge!',
        data: userChallenge
      });

    } catch (err) {
      console.error('Join solo challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // LEAVE CHALLENGE
  leave: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const existing = await userChallengeModel
        .getByUserAndChallenge(userId, id);
      if (!existing) {
        return res.status(404).json({
          message: 'You are not participating in this challenge.'
        });
      }

      // If team challenge, also remove from team
      if (existing.team_id) {
        await teamMemberModel.delete(userId, existing.team_id);
      }

      await userChallengeModel.delete(userId, id);

      res.json({ message: 'Successfully left challenge.' });

    } catch (err) {
      console.error('Leave challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = challengeController;