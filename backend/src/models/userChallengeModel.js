// backend/src/models/userChallengeModel.js
const pool = require('../config/db');

const userChallengeModel = {

  // Get user challenge by user_id and challenge_id
  getByUserAndChallenge: async (userId, challengeId) => {
    const result = await pool.query(
      `SELECT * FROM user_challenge
       WHERE user_id = $1 AND challenge_id = $2`,
      [userId, challengeId]
    );
    return result.rows[0];
  },

  // Get all challenges user is participating in
  getMyChallenge: async (userId) => {
    const result = await pool.query(
      `SELECT uc.*, c.name AS challenge_name,
              c.image AS challenge_image,
              c.type, c.start_date, c.end_date,
              c.about, c.target_type, c.target_value,
              c.status AS challenge_status
       FROM user_challenge uc
       LEFT JOIN challenge c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.id DESC`,
      [userId]
    );
    return result.rows;
  },

  // Join a challenge
  create: async (userId, challengeId, teamId) => {
    const result = await pool.query(
      `INSERT INTO user_challenge
        (user_id, challenge_id, progress_value, team_id)
       VALUES ($1, $2, 0, $3)
       RETURNING *`,
      [userId, challengeId, teamId || null]
    );
    return result.rows[0];
  },

  // Leave a challenge
  delete: async (userId, challengeId) => {
    await pool.query(
      `DELETE FROM user_challenge
       WHERE user_id = $1 AND challenge_id = $2`,
      [userId, challengeId]
    );
  },

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      'DELETE FROM user_challenge WHERE challenge_id = $1', [challengeId]
    );
  },

  // Update progress value
  updateProgress: async (userId, challengeId, progressValue) => {
    const result = await pool.query(
      `UPDATE user_challenge
       SET progress_value = $1
       WHERE user_id = $2 AND challenge_id = $3
       RETURNING *`,
      [progressValue, userId, challengeId]
    );
    return result.rows[0];
  },

  // Get team progress for a challenge
  getTeamProgress: async (teamId, challengeId) => {
    const result = await pool.query(
      `SELECT SUM(progress_value) AS total_progress
       FROM user_challenge
       WHERE team_id = $1 AND challenge_id = $2`,
      [teamId, challengeId]
    );
    return parseFloat(result.rows[0].total_progress) || 0;
  },

  // Get participants count for a challenge
  getParticipantsCount: async (challengeId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_challenge
       WHERE challenge_id = $1`,
      [challengeId]
    );
    return parseInt(result.rows[0].count);
  },

  // ── NEW: Get all active challenges that a user is participating in
  //         and that include the given action as eligible
  getActiveForUserAndAction: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT uc.*, c.target_type, c.target_value, c.type,
              c.name AS challenge_name
       FROM user_challenge uc
       JOIN challenge c ON uc.challenge_id = c.id
       JOIN eligible_action ea ON ea.challenge_id = c.id
       WHERE uc.user_id = $1
         AND ea.action_id = $2
         AND c.status = 'active'
         AND CURRENT_DATE BETWEEN c.start_date AND c.end_date`,
      [userId, actionId]
    );
    return result.rows;
  },

  // Get solo rankings for a challenge (top N participants by progress)
  getSoloRankings: async (challengeId, limit = 5) => {
    const result = await pool.query(
      `SELECT
         uc.user_id,
         u.username,
         u.profile_image,
         uc.progress_value,
         ROW_NUMBER() OVER (ORDER BY uc.progress_value DESC) AS rank
       FROM user_challenge uc
       JOIN "user" u ON uc.user_id = u.id
       WHERE uc.challenge_id = $1
       ORDER BY uc.progress_value DESC
       LIMIT $2`,
      [challengeId, limit]
    );
    return result.rows;
  },

  // Get team rankings for a challenge (top N teams by combined progress)
  getTeamRankings: async (challengeId, limit = 5) => {
    const result = await pool.query(
      `SELECT
         t.id           AS team_id,
         t.name         AS team_name,
         SUM(uc.progress_value) AS team_progress,
         COUNT(uc.user_id)      AS member_count,
         DENSE_RANK() OVER (ORDER BY SUM(uc.progress_value) DESC) AS rank
       FROM user_challenge uc
       JOIN team t ON uc.team_id = t.id
       WHERE uc.challenge_id = $1 AND uc.team_id IS NOT NULL
       GROUP BY t.id, t.name
       ORDER BY team_progress DESC
       LIMIT $2`,
      [challengeId, limit]
    );
    return result.rows;
  },

  // Get the user's own rank in a challenge (solo)
  getUserRank: async (userId, challengeId) => {
    const result = await pool.query(
      `SELECT rank FROM (
         SELECT user_id,
                ROW_NUMBER() OVER (ORDER BY progress_value DESC) AS rank
         FROM user_challenge
         WHERE challenge_id = $1
       ) ranked
       WHERE user_id = $2`,
      [challengeId, userId]
    );
    return result.rows[0]?.rank || null;
  },

  // Get user's team rank in a challenge (team)
  getTeamRank: async (teamId, challengeId) => {
    const result = await pool.query(
      `SELECT rank FROM (
         SELECT team_id,
                DENSE_RANK() OVER (
                  ORDER BY SUM(progress_value) DESC
                ) AS rank
         FROM user_challenge
         WHERE challenge_id = $1 AND team_id IS NOT NULL
         GROUP BY team_id
       ) ranked
       WHERE team_id = $2`,
      [challengeId, teamId]
    );
    return result.rows[0]?.rank || null;
  },

};

module.exports = userChallengeModel;