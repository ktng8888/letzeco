const pool = require('../config/db');

const dashboardModel = {

  getTotalUsers: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) FROM "user"'
    );
    return parseInt(result.rows[0].count);
  },

  getTotalActionsLogged: async () => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE status = 'completed'`
    );
    return parseInt(result.rows[0].count);
  },

  getTotalActionsAvailable: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) FROM action'
    );
    return parseInt(result.rows[0].count);
  },

  getTotalChallenges: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) FROM challenge'
    );
    return parseInt(result.rows[0].count);
  },

  getActiveChallenges: async () => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM challenge
       WHERE status = 'active'`
    );
    return parseInt(result.rows[0].count);
  },

  getPopularActions: async () => {
    const result = await pool.query(
      `SELECT a.name, COUNT(ua.id) AS log_count
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       WHERE ua.status = 'completed'
       GROUP BY a.name
       ORDER BY log_count DESC
       LIMIT 5`
    );
    return result.rows;
  },

};

module.exports = dashboardModel;