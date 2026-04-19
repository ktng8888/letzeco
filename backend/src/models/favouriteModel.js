const pool = require('../config/db');

const favouriteModel = {

  // Get all favourites for a user
  getByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT f.*, a.name AS action_name,
              a.image AS action_image,
              a.xp_reward, a.time_limit,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              (SELECT COUNT(*) FROM user_action ua 
                WHERE ua.user_id = f.user_id 
                  AND ua.action_id = f.action_id 
                  AND ua.status = 'completed'
              ) AS user_log_count
       FROM favourite f
       LEFT JOIN action a ON f.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE f.user_id = $1
       ORDER BY f.id ASC`,
      [userId]
    );
    return result.rows;
  },

  // Check if action is favourited by user
  checkExists: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT * FROM favourite
       WHERE user_id = $1 AND action_id = $2`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Add to favourites
  create: async (userId, actionId) => {
    const result = await pool.query(
      `INSERT INTO favourite (user_id, action_id)
       VALUES ($1, $2) RETURNING *`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Remove from favourites
  delete: async (userId, actionId) => {
    await pool.query(
      `DELETE FROM favourite
       WHERE user_id = $1 AND action_id = $2`,
      [userId, actionId]
    );
  },

};

module.exports = favouriteModel;