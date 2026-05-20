// backend/src/models/userChallengeRewardModel.js  (FULL REPLACEMENT)
const pool = require('../config/db');

const userChallengeRewardModel = {

  // Check if user already has this reward
  checkExists: async (userId, challengeRewardId) => {
    const result = await pool.query(
      `SELECT * FROM user_challenge_reward
       WHERE user_id = $1 AND challenge_reward_id = $2`,
      [userId, challengeRewardId]
    );
    return result.rows[0];
  },

  // Give a gift to a user (unclaimed by default)
  create: async (userId, challengeRewardId) => {
    const result = await pool.query(
      `INSERT INTO user_challenge_reward
        (user_id, challenge_reward_id, obtain_date, status)
       VALUES ($1, $2, NOW(), 'unclaimed')
       RETURNING *`,
      [userId, challengeRewardId]
    );
    return result.rows[0];
  },

  // Get all unclaimed gifts for a user with full reward details
  getUnclaimedByUser: async (userId) => {
    const result = await pool.query(
      `SELECT
         ucr.id             AS user_challenge_reward_id,
         ucr.user_id,
         ucr.obtain_date,
         ucr.status,
         cr.id              AS challenge_reward_id,
         cr.type,
         cr.top_value,
         cr.xp_reward,
         b.name             AS badge_name,
         b.image            AS badge_image,
         c.id               AS challenge_id,
         c.name             AS challenge_name,
         c.image            AS challenge_image
       FROM user_challenge_reward ucr
       JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       JOIN challenge c         ON cr.challenge_id = c.id
       LEFT JOIN badge b        ON cr.badge_id = b.id
       WHERE ucr.user_id = $1 AND ucr.status = 'unclaimed'
       ORDER BY ucr.obtain_date DESC`,
      [userId]
    );
    return result.rows;
  },

  // Count unclaimed gifts (used for the home gift badge dot)
  countUnclaimed: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_challenge_reward
       WHERE user_id = $1 AND status = 'unclaimed'`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get single gift with full details (used before claiming)
  getById: async (id) => {
    const result = await pool.query(
      `SELECT
         ucr.*,
         cr.type, cr.top_value, cr.xp_reward, cr.badge_id,
         b.name             AS badge_name,
         b.image            AS badge_image,
         c.name             AS challenge_name
       FROM user_challenge_reward ucr
       JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       JOIN challenge c         ON cr.challenge_id = c.id
       LEFT JOIN badge b        ON cr.badge_id = b.id
       WHERE ucr.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Mark gift as claimed
  claim: async (id) => {
    const result = await pool.query(
      `UPDATE user_challenge_reward
       SET status = 'claimed'
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Get claimed challenge badges owned by a user
  getClaimedBadgesByUser: async (userId) => {
    const result = await pool.query(
      `SELECT
         ucr.id             AS user_challenge_reward_id,
         ucr.obtain_date,
         ucr.status,
         cr.id              AS challenge_reward_id,
         cr.type,
         cr.top_value,
         cr.xp_reward,
         b.id               AS badge_id,
         b.name             AS badge_name,
         b.image            AS badge_image,
         c.id               AS challenge_id,
         c.name             AS challenge_name
       FROM user_challenge_reward ucr
       JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       JOIN challenge c         ON cr.challenge_id = c.id
       JOIN badge b             ON cr.badge_id = b.id
       WHERE ucr.user_id = $1
         AND ucr.status = 'claimed'
         AND cr.badge_id IS NOT NULL
       ORDER BY ucr.obtain_date DESC, ucr.id DESC`,
      [userId]
    );
    return result.rows;
  },

};

module.exports = userChallengeRewardModel;
