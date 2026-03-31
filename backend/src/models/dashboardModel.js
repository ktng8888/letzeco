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

  getTotalAdmins: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM admin');
    return parseInt(result.rows[0].count);
  },

  getTotalCategories: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM action_category');
    return parseInt(result.rows[0].count);
  },

  getTotalEnvironmentalImpact: async () => {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(co2_saved), 0) AS total_co2,
        COALESCE(SUM(litre_saved), 0) AS total_litre,
        COALESCE(SUM(kwh_saved), 0) AS total_kwh
      FROM user_action WHERE status = 'completed'`
    );
    return result.rows[0];
  },

  getTopActions: async (limit = 10) => {
    const result = await pool.query(
      `SELECT a.name, COUNT(ua.id) AS log_count
      FROM user_action ua
      LEFT JOIN action a ON ua.action_id = a.id
      WHERE ua.status = 'completed'
      GROUP BY a.name
      ORDER BY log_count DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

};

module.exports = dashboardModel;