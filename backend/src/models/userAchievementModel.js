const pool = require('../config/db');

const userAchievementModel = {

  // Get all achievements with user progress
  getAllWithProgress: async (userId) => {
    const result = await pool.query(
      `SELECT
        a.*,
        b.name AS badge_name,
        b.image AS badge_image,
        ac.name AS category_name,
        ua.achieve_date,
        ua.id AS user_achievement_id,
        CASE WHEN ua.id IS NOT NULL
          THEN true ELSE false
        END AS is_unlocked
       FROM achievement a
       LEFT JOIN badge b ON a.badge_id = b.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       LEFT JOIN user_achievement ua
         ON a.id = ua.achievement_id
         AND ua.user_id = $1
       ORDER BY a.id ASC`,
      [userId]
    );
    return result.rows;
  },

  // Get only unlocked achievements for user
  getUnlocked: async (userId) => {
    const result = await pool.query(
      `SELECT
        ua.*,
        a.name AS achievement_name,
        a.bonus_xp, a.type,
        a.target_value,
        b.name AS badge_name,
        b.image AS badge_image
       FROM user_achievement ua
       LEFT JOIN achievement a ON ua.achievement_id = a.id
       LEFT JOIN badge b ON a.badge_id = b.id
       WHERE ua.user_id = $1
       ORDER BY ua.achieve_date DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get user achievement by achievement id
  getByAchievementId: async (userId, achievementId) => {
    const result = await pool.query(
      `SELECT * FROM user_achievement
       WHERE user_id = $1 AND achievement_id = $2`,
      [userId, achievementId]
    );
    return result.rows[0];
  },

  // Get progress for log-based achievement
  getLogProgress: async (userId, actionCategoryId) => {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       WHERE ua.user_id = $1
       AND a.action_category_id = $2
       AND ua.status = 'completed'`,
      [userId, actionCategoryId]
    );
    return parseInt(result.rows[0].count);
  },

};

module.exports = userAchievementModel;