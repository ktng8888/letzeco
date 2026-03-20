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

};

module.exports = userChallengeModel;