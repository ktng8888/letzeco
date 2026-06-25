const challengeModel = require('../../models/challengeModel');
const userActionModel = require('../../models/userActionModel');
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
          const teamCount = challenge.type === 'team'
            ? await teamModel.getTeamCountByChallenge(challenge.id)
            : 0;

          // Get rewards
          const rewards = await challengeRewardModel
            .getByChallengeIdForUser(challenge.id, userId);

          return {
            ...challenge,
            is_participating: participating ? true : false,
            user_challenge_status: participating
              ? participating.status || 'active' : null,
            progress_value: participating
              ? participating.progress_value : 0,
            eligible_actions: eligibleActions,
            participants_count: participantsCount,
            team_count: teamCount,
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
        .getByChallengeIdForUser(id, userId);

      const participantsCount = await userChallengeModel
        .getParticipantsCount(id);

      // Get team details if team challenge and user is participating
      let teamDetails = null;
      let userRank = null;
      let teamRank = null;

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
        teamRank = await userChallengeModel.getTeamRank(
          participating.team_id, id
        );

        teamDetails = {
          ...team,
          members,
          member_count: memberCount,
          team_progress: teamProgress
        };
      } else if (challenge.type === 'solo' && participating) {
        userRank = await userChallengeModel.getUserRank(userId, id);
      }

      res.json({
        message: 'Challenge retrieved successfully.',
        data: {
          ...challenge,
          is_participating: participating ? true : false,
          user_challenge_status: participating
            ? participating.status || 'active' : null,
          progress_value: participating
            ? participating.progress_value : 0,
          your_rank: userRank,
          team_rank: teamRank,
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
            .getByChallengeIdForUser(uc.challenge_id, userId);
          const participantsCount = await userChallengeModel
            .getParticipantsCount(uc.challenge_id);
          const teamCount = uc.type === 'team'
            ? await teamModel.getTeamCountByChallenge(uc.challenge_id)
            : 0;

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
            participants_count: participantsCount,
            team_count: teamCount,
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
        const team = await teamModel.getById(existing.team_id);
        await teamMemberModel.delete(userId, existing.team_id);
        await userChallengeModel.delete(userId, id);

        if (team && Number(team.leader_user_id) === Number(userId)) {
          const nextLeader = await teamMemberModel
            .getNextLeader(existing.team_id);

          if (nextLeader) {
            await teamModel.updateLeader(
              existing.team_id, nextLeader.user_id
            );
          } else {
            await teamModel.delete(existing.team_id);
          }
        }

        return res.json({ message: 'Successfully left challenge.' });
      }

      await userChallengeModel.delete(userId, id);

      res.json({ message: 'Successfully left challenge.' });

    } catch (err) {
      console.error('Leave challenge error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

   
  // GET /api/challenges/:id/ranking
  getRanking: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
 
      if (challenge.type === 'solo') {
        const top5 = await userChallengeModel.getSoloRankings(id, 5);
        const userRank = await userChallengeModel.getUserRank(userId, id);
        const totalCount = await userChallengeModel.getParticipantsCount(id);
 
        return res.json({
          message: 'Ranking retrieved.',
          data: {
            type: 'solo',
            top: top5,
            your_rank: userRank,
            total_participants: totalCount,
          }
        });
      } else {
        // Team challenge
        const participating = await userChallengeModel
          .getByUserAndChallenge(userId, id);
        const teamId = participating?.team_id || null;
 
        const top5 = await userChallengeModel.getTeamRankings(id, 5);
        const teamRank = teamId
          ? await userChallengeModel.getTeamRank(teamId, id)
          : null;
        const totalTeams = top5.length; // approximate
 
        return res.json({
          message: 'Ranking retrieved.',
          data: {
            type: 'team',
            top: top5,
            your_team_rank: teamRank,
            your_team_id: teamId,
            total_teams: totalTeams,
          }
        });
      }
    } catch (err) {
      console.error('Get ranking error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },
 
  // GET /api/challenges/:id/activity
  /*
  getActivity: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
 
      const activity = await userActionModel.getChallengeActivity(userId, id);
 
      return res.json({
        message: 'Activity retrieved.',
        data: {
          activity,        // array of { day, day_date, action_count }
          challenge_start: challenge.start_date,
          challenge_end:   challenge.end_date,
        }
      });
    } catch (err) {
      console.error('Get activity error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },
  */

  getActivity: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const challenge = await challengeModel.getById(id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      if (challenge.type === 'team') {
        // Get user's team for this challenge
        const participating = await userChallengeModel
          .getByUserAndChallenge(userId, id);
        const teamId = participating?.team_id;

        if (!teamId) {
          return res.json({
            message: 'Activity retrieved.',
            data: { type: 'team', feed: [] }
          });
        }

        const feed = await userActionModel.getTeamChallengeActivity(teamId, id);
        return res.json({
          message: 'Activity retrieved.',
          data: { type: 'team', feed }
        });

      } else {
        // Solo — existing behaviour
        const activity = await userActionModel
          .getChallengeActivity(userId, id);
        return res.json({
          message: 'Activity retrieved.',
          data: {
            type: 'solo',
            activity,
            challenge_start: challenge.start_date,
            challenge_end:   challenge.end_date,
          }
        });
      }
    } catch (err) {
      console.error('Get activity error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = challengeController;
