const pool = require('../config/db');

const teamModel = {

  // Get team by ID
  getById: async (id) => {
    const result = await pool.query(
      `SELECT t.*,
              u.username AS leader_username,
              u.profile_image AS leader_image
       FROM team t
       LEFT JOIN "user" u ON t.leader_user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get team by code
  getByCode: async (code) => {
    const result = await pool.query(
      'SELECT * FROM team WHERE code = $1', [code]
    );
    return result.rows[0];
  },

  getByChallenge: async (challengeId) => {
    const result = await pool.query(
      'SELECT * FROM team WHERE challenge_id = $1', [challengeId]
    );
    return result.rows;
  },

  // Get public teams for a challenge
  getPublicTeams: async (challengeId) => {
    const result = await pool.query(
      `WITH team_users AS (
         SELECT id AS team_id, leader_user_id AS user_id
         FROM team
         WHERE challenge_id = $1
         UNION
         SELECT tm.team_id, tm.user_id
         FROM team_member tm
         JOIN team t ON t.id = tm.team_id
         WHERE t.challenge_id = $1
       )
       SELECT t.*,
              u.username AS leader_username,
              COUNT(DISTINCT tu.user_id) AS member_count,
              COALESCE(SUM(uc.progress_value), 0) AS total_progress
       FROM team t
       LEFT JOIN "user" u ON t.leader_user_id = u.id
       LEFT JOIN team_users tu ON t.id = tu.team_id
       LEFT JOIN user_challenge uc ON t.id = uc.team_id
         AND uc.challenge_id = $1
         AND uc.user_id = tu.user_id
       WHERE t.challenge_id = $1
       AND t.is_private = false
       GROUP BY t.id, u.username
       ORDER BY total_progress DESC`,
      [challengeId]
    );
    return result.rows;
  },

  // Create team
  create: async (name, leaderUserId, isPrivate, challengeId) => {
    // Generate unique 6-char code
    const code = Math.random().toString(36)
      .substring(2, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO team
        (name, code, leader_user_id, challenge_id,
         is_private, created_date)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, code, leaderUserId, challengeId, isPrivate || false]
    );
    return result.rows[0];
  },

  // Delete team
  delete: async (id) => {
    await pool.query('DELETE FROM team WHERE id = $1', [id]);
  },

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      'DELETE FROM team WHERE challenge_id = $1', [challengeId]
    );
  },

  // Get member count
  getMemberCount: async (teamId) => {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT user_id)
       FROM (
         SELECT leader_user_id AS user_id
         FROM team
         WHERE id = $1
         UNION
         SELECT user_id
         FROM team_member
         WHERE team_id = $1
       ) team_users`,
      [teamId]
    );
    return parseInt(result.rows[0].count);
  },

};

module.exports = teamModel;
