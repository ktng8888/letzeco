const pool = require('../config/db');

const userActionModel = {

  // Get user log count for specific action
  getUserLogCount: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE user_id = $1 AND action_id = $2
       AND status = 'completed'`,
      [userId, actionId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get global log count for specific action
  getGlobalLogCount: async (actionId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE action_id = $1 AND status = 'completed'`,
      [actionId]
    );
    return parseInt(result.rows[0].count);
  },

  // Check if user is currently logging this action
  getInProgress: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT * FROM user_action
       WHERE user_id = $1 AND action_id = $2
       AND status = 'in_progress'`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Check if user has ANY action in progress
  getAnyInProgress: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.time_limit, a.xp_reward
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       WHERE ua.user_id = $1
       AND ua.status = 'in_progress'`,
      [userId]
    );
    return result.rows[0];
  },

  // Get today's logged actions for user
  getTodayActions: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.xp_reward, a.time_limit,
              ac.name AS category_name
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.user_id = $1
       AND DATE(ua.start_time) = CURRENT_DATE
       ORDER BY ua.start_time DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get log history for user
  getHistory: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.xp_reward,
              ac.name AS category_name
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.user_id = $1
       AND ua.status = 'completed'
       ORDER BY ua.end_time DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get single log by ID
  getById: async (id) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.description, a.importance,
              a.xp_reward, a.time_limit,
              a.co2_saved, a.litre_saved, a.kwh_saved,
              a.calc_info, a.source,
              ac.name AS category_name
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Start logging an action
  create: async (userId, actionId) => {
    const result = await pool.query(
      `INSERT INTO user_action
        (user_id, action_id, status, start_time)
       VALUES ($1, $2, 'in_progress', NOW())
       RETURNING *`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Complete an action (PUT - change status)
  complete: async (id, xpGained, co2Saved, litreSaved, kwhSaved) => {
    const result = await pool.query(
      `UPDATE user_action SET
        status = 'completed',
        end_time = NOW(),
        xp_gained = $1,
        co2_saved = $2,
        litre_saved = $3,
        kwh_saved = $4
       WHERE id = $5
       RETURNING *`,
      [xpGained, co2Saved, litreSaved, kwhSaved, id]
    );
    return result.rows[0];
  },

  // Cancel an action (UPDATE status)
  cancel: async (id) => {
    const result = await pool.query(
      `UPDATE user_action SET
        status = 'cancelled',
        end_time = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Cancel an action  (DELETE whole row)
  /*
  cancel: async (id) => {
    await pool.query(
      `DELETE FROM user_action WHERE id = $1`,
      [id]
    );
  },
  */

  // Get total completed actions count for user
  getTotalCompleted: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

};

module.exports = userActionModel;