const pool = require('../config/db');

const userStreakRewardModel = {

  // Get all streak rewards with user status
  getAllWithStatus: async (userId) => {
    const result = await pool.query(
      `SELECT
        sr.*,
        b.name AS badge_name,
        b.image AS badge_image,
        usr.id AS user_streak_reward_id,
        usr.obtain_date,
        usr.status AS claim_status,
        CASE WHEN usr.id IS NOT NULL
          THEN true ELSE false
        END AS is_earned
       FROM streak_reward sr
       LEFT JOIN badge b ON sr.badge_id = b.id
       LEFT JOIN user_streak_reward usr
         ON sr.id = usr.streak_reward_id
         AND usr.user_id = $1
       ORDER BY sr.day ASC`,
      [userId]
    );
    return result.rows;
  },

  // Get unclaimed rewards for user
  getUnclaimed: async (userId) => {
    const result = await pool.query(
      `SELECT
        usr.*,
        sr.day, sr.xp_reward,
        b.name AS badge_name,
        b.image AS badge_image
       FROM user_streak_reward usr
       LEFT JOIN streak_reward sr ON usr.streak_reward_id = sr.id
       LEFT JOIN badge b ON sr.badge_id = b.id
       WHERE usr.user_id = $1
       AND usr.status = 'unclaimed'`,
      [userId]
    );
    return result.rows;
  },

  // Get by id with full details
  getById: async (id) => {
    const result = await pool.query(
      `SELECT usr.*,
              sr.day, sr.xp_reward,
              b.name AS badge_name,
              b.image AS badge_image
       FROM user_streak_reward usr
       LEFT JOIN streak_reward sr ON usr.streak_reward_id = sr.id
       LEFT JOIN badge b ON sr.badge_id = b.id
       WHERE usr.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Claim streak reward
  claim: async (id) => {
    const result = await pool.query(
      `UPDATE user_streak_reward
       SET status = 'claimed'
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

};

module.exports = userStreakRewardModel;