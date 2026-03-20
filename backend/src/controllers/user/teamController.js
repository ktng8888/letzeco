const teamModel = require('../../models/teamModel');
const teamMemberModel = require('../../models/teamMemberModel');
const challengeModel = require('../../models/challengeModel');
const userChallengeModel = require('../../models/userChallengeModel');

const teamController = {

  // CREATE TEAM & JOIN TEAM CHALLENGE
  create: async (req, res) => {
    const userId = req.user.id;
    const { name, is_private, challenge_id } = req.body;

    try {
      if (!name || !challenge_id) {
        return res.status(400).json({
          message: 'Team name and challenge are required.'
        });
      }

      // Check challenge exists and is team type
      const challenge = await challengeModel.getById(challenge_id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }
      if (challenge.type !== 'team') {
        return res.status(400).json({
          message: 'This challenge is not a team challenge.'
        });
      }

      // Check if user already participating in this challenge
      const existing = await userChallengeModel
        .getByUserAndChallenge(userId, challenge_id);
      if (existing) {
        return res.status(400).json({
          message: 'Already participating in this challenge.'
        });
      }

      // Create team
      const team = await teamModel.create(
        name, userId, is_private, challenge_id
      );

      // Add creator as first member
      await teamMemberModel.create(userId, team.id);

      // Join the challenge with team
      await userChallengeModel.create(userId, challenge_id, team.id);

      res.status(201).json({
        message: 'Team created successfully!',
        data: {
          ...team,
          member_count: 1
        }
      });

    } catch (err) {
      console.error('Create team error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET TEAM DETAILS
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const team = await teamModel.getById(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found.' });
      }

      const members = await teamMemberModel.getByTeamId(id);
      const memberCount = await teamModel.getMemberCount(id);

      res.json({
        message: 'Team retrieved successfully.',
        data: {
          ...team,
          members,
          member_count: memberCount
        }
      });

    } catch (err) {
      console.error('Get team error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET PUBLIC TEAMS FOR A CHALLENGE
  getPublicTeams: async (req, res) => {
    const { challengeId } = req.params;
    try {
      const challenge = await challengeModel.getById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found.' });
      }

      const teams = await teamModel.getPublicTeams(challengeId);

      res.json({
        message: 'Public teams retrieved successfully.',
        data: teams
      });

    } catch (err) {
      console.error('Get public teams error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // JOIN PUBLIC TEAM
  joinPublic: async (req, res) => {
    const userId = req.user.id;
    const { teamId } = req.params;

    try {
      const team = await teamModel.getById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found.' });
      }

      // Check if team is full (max 5 members)
      const memberCount = await teamModel.getMemberCount(teamId);
      if (memberCount >= 5) {
        return res.status(400).json({ message: 'Team is full.' });
      }

      // Check if already a member
      const existingMember = await teamMemberModel.checkExists(
        userId, teamId
      );
      if (existingMember) {
        return res.status(400).json({
          message: 'Already a member of this team.'
        });
      }

      // Check if already participating in this challenge
      const existingChallenge = await userChallengeModel
        .getByUserAndChallenge(userId, team.challenge_id);
      if (existingChallenge) {
        return res.status(400).json({
          message: 'Already participating in this challenge.'
        });
      }

      // Add to team
      await teamMemberModel.create(userId, teamId);

      // Join the challenge with team
      await userChallengeModel.create(userId, team.challenge_id, teamId);

      res.status(201).json({
        message: 'Successfully joined team!',
        data: {
          team_id: team.id,
          team_name: team.name,
          challenge_id: team.challenge_id
        }
      });

    } catch (err) {
      console.error('Join public team error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // JOIN PRIVATE TEAM BY CODE
  joinByCode: async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;

    try {
      if (!code) {
        return res.status(400).json({ message: 'Team code is required.' });
      }

      const team = await teamModel.getByCode(code.toUpperCase());
      if (!team) {
        return res.status(404).json({ message: 'Invalid team code.' });
      }

      // Check if team is full
      const memberCount = await teamModel.getMemberCount(team.id);
      if (memberCount >= 5) {
        return res.status(400).json({ message: 'Team is full.' });
      }

      // Check if already a member
      const existingMember = await teamMemberModel.checkExists(
        userId, team.id
      );
      if (existingMember) {
        return res.status(400).json({
          message: 'Already a member of this team.'
        });
      }

      // Check if already participating in this challenge
      const existingChallenge = await userChallengeModel
        .getByUserAndChallenge(userId, team.challenge_id);
      if (existingChallenge) {
        return res.status(400).json({
          message: 'Already participating in this challenge.'
        });
      }

      // Add to team
      await teamMemberModel.create(userId, team.id);

      // Join the challenge with team
      await userChallengeModel.create(
        userId, team.challenge_id, team.id
      );

      res.status(201).json({
        message: 'Successfully joined team by code!',
        data: {
          team_id: team.id,
          team_name: team.name,
          challenge_id: team.challenge_id
        }
      });

    } catch (err) {
      console.error('Join by code error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // LEAVE TEAM
  leave: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const team = await teamModel.getById(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found.' });
      }

      // Check if member
      const member = await teamMemberModel.checkExists(userId, id);
      if (!member) {
        return res.status(404).json({
          message: 'You are not a member of this team.'
        });
      }

      // If leader, delete the whole team
      if (team.leader_user_id === userId) {
        await userChallengeModel.delete(userId, team.challenge_id);
        await teamModel.delete(id);
        return res.json({
          message: 'Team deleted as you were the leader.'
        });
      }

      // Remove from team and challenge
      await teamMemberModel.delete(userId, id);
      await userChallengeModel.delete(userId, team.challenge_id);

      res.json({ message: 'Successfully left team.' });

    } catch (err) {
      console.error('Leave team error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = teamController;