const pool = require('../config/db');

const teamMemberModel = {

  // Get all members of a team
  getByTeamId: async (teamId) => {
    const result = await pool.query(
      `WITH team_users AS (
         SELECT
           t.id AS team_id,
           t.leader_user_id AS user_id,
           t.created_date AS joined_date
         FROM team t
         WHERE t.id = $1
         UNION
         SELECT
           tm.team_id,
           tm.user_id,
           tm.joined_date
         FROM team_member tm
         WHERE tm.team_id = $1
       ),
       unique_team_users AS (
         SELECT
           team_id,
           user_id,
           MIN(joined_date) AS joined_date
         FROM team_users
         GROUP BY team_id, user_id
       )
       SELECT
              tu.team_id,
              tu.user_id,
              tu.joined_date,
              t.leader_user_id,
              (tu.user_id = t.leader_user_id) AS is_leader,
              u.username, u.profile_image,
              u.level, u.total_xp,
              uc.progress_value AS contribution
       FROM unique_team_users tu
       JOIN team t ON t.id = tu.team_id
       LEFT JOIN "user" u ON tu.user_id = u.id
       LEFT JOIN user_challenge uc ON uc.user_id = tu.user_id
         AND uc.team_id = $1
       ORDER BY (tu.user_id = t.leader_user_id) DESC,
                uc.progress_value DESC NULLS LAST,
                tu.joined_date ASC`,
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

  getNextLeader: async (teamId) => {
    const result = await pool.query(
      `SELECT user_id
       FROM team_member
       WHERE team_id = $1
       ORDER BY joined_date ASC, user_id ASC
       LIMIT 1`,
      [teamId]
    );
    return result.rows[0];
  },

  deleteByTeamId: async (teamId) => {
    await pool.query(
      'DELETE FROM team_member WHERE team_id = $1', [teamId]
    );
  },

};

module.exports = teamMemberModel;
