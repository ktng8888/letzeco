const pool = require('../config/db');

const teamMemberModel = {

  // Get all members of a team
  getByTeamId: async (teamId) => {
    const result = await pool.query(
      `SELECT tm.*,
              u.username, u.profile_image,
              u.level, u.total_xp,
              uc.progress_value AS contribution
       FROM team_member tm
       LEFT JOIN "user" u ON tm.user_id = u.id
       LEFT JOIN user_challenge uc ON uc.user_id = tm.user_id
         AND uc.team_id = $1
       WHERE tm.team_id = $1
       ORDER BY uc.progress_value DESC`,
      [teamId]
    );
    return result.rows;
  },

  // Check if user is member of team
  checkExists: async (userId, teamId) => {
    const result = await pool.query(
      `SELECT * FROM team_member
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );
    return result.rows[0];
  },

  // Add member to team
  create: async (userId, teamId) => {
    const result = await pool.query(
      `INSERT INTO team_member (user_id, team_id, joined_date)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, teamId]
    );
    return result.rows[0];
  },

  // Remove member from team
  delete: async (userId, teamId) => {
    await pool.query(
      `DELETE FROM team_member
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );
  },

};

module.exports = teamMemberModel;