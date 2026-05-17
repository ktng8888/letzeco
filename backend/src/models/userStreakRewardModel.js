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
        COALESCE(usr.day, sr.day) AS day,
        COALESCE(usr.xp_reward, sr.xp_reward) AS xp_reward,
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
              COALESCE(sr.day, usr.day) AS day,
              COALESCE(sr.xp_reward, usr.xp_reward) AS xp_reward,
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

  getByUserAndReward: async (userId, rewardId) => {
    const result = await pool.query(
      `SELECT * FROM user_streak_reward
      WHERE user_id = $1 AND streak_reward_id = $2`,
      [userId, rewardId]
    );
    return result.rows[0] || null;
  },

  getByUserAndDay: async (userId, day) => {
    const result = await pool.query(
      `SELECT usr.*
      FROM user_streak_reward usr
      LEFT JOIN streak_reward sr ON usr.streak_reward_id = sr.id
      WHERE usr.user_id = $1
        AND COALESCE(usr.day, sr.day) = $2`,
      [userId, day]
    );
    return result.rows[0] || null;
  },

  createForDay: async (userId, day, xpReward) => {
    const result = await pool.query(
      `INSERT INTO user_streak_reward
        (user_id, streak_reward_id, day, xp_reward, obtain_date, status)
      VALUES ($1, NULL, $2, $3, NOW(), 'unclaimed')
      RETURNING *`,
      [userId, day, xpReward]
    );
    return result.rows[0];
  },

  create: async (userId, rewardId, day = null, xpReward = null) => {
    const result = await pool.query(
      `INSERT INTO user_streak_reward
        (user_id, streak_reward_id, day, xp_reward, obtain_date, status)
      VALUES ($1, $2, $3, $4, NOW(), 'unclaimed')
      RETURNING *`,
      [userId, rewardId, day, xpReward]
    );
    return result.rows[0];
  },

  deleteByUserId: async (userId) => {
    await pool.query(
      `DELETE FROM user_streak_reward
       WHERE user_id = $1 AND status = 'unclaimed'`,
      [userId]
    );
  },

  // Claim streak reward
  claim: async (id) => {
    const result = await pool.query(
      `UPDATE user_streak_reward
       SET status = 'claimed'
       WHERE id = $1 AND status <> 'claimed'
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

};

module.exports = userStreakRewardModel;
