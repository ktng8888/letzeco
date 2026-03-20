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

  // Get public teams for a challenge
  getPublicTeams: async (challengeId) => {
    const result = await pool.query(
      `SELECT t.*,
              u.username AS leader_username,
              COUNT(tm.id) AS member_count,
              COALESCE(SUM(uc.progress_value), 0) AS total_progress
       FROM team t
       LEFT JOIN "user" u ON t.leader_user_id = u.id
       LEFT JOIN team_member tm ON t.id = tm.team_id
       LEFT JOIN user_challenge uc ON t.id = uc.team_id
         AND uc.challenge_id = $1
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

  // Get member count
  getMemberCount: async (teamId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM team_member
       WHERE team_id = $1`,
      [teamId]
    );
    return parseInt(result.rows[0].count);
  },

};

module.exports = teamModel;