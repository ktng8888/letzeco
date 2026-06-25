const pool = require('../config/db');

const challengeRewardModel = {

  getByChallengeId: async (challengeId) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1
       ORDER BY cr.type DESC, cr.top_value ASC NULLS FIRST`,
      [challengeId]
    );
    return result.rows;
  },

  getByChallengeIdForUser: async (challengeId, userId) => {
    const result = await pool.query(
      `SELECT
         cr.*,
         b.name AS badge_name,
         b.image AS badge_image,
         ucr.id AS user_challenge_reward_id,
         ucr.status AS user_reward_status,
         ucr.obtain_date AS user_reward_obtain_date
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       LEFT JOIN user_challenge_reward ucr
         ON ucr.challenge_reward_id = cr.id
        AND ucr.user_id = $2
       WHERE cr.challenge_id = $1
       ORDER BY cr.type DESC, cr.top_value ASC NULLS FIRST`,
      [challengeId, userId]
    );
    return result.rows;
  },

  getCompletionReward: async (challengeId) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1 AND cr.type = 'completion'`,
      [challengeId]
    );
    return result.rows[0];
  },

  getRankingRewards: async (challengeId) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1 AND cr.type = 'ranking'
       ORDER BY cr.top_value ASC`,
      [challengeId]
    );
    return result.rows;
  },

  create: async ({ challengeId, badgeId, type, topValue, xpReward }) => {
    const result = await pool.query(
      `INSERT INTO challenge_reward
        (challenge_id, badge_id, type, top_value, xp_reward)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [challengeId, badgeId || null, type, topValue || null, xpReward || 0]
    );
    return result.rows[0];
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  findMatching: async ({ challengeId, type, topValue }) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1
         AND cr.type = $2
         AND (
           ($3::int IS NULL AND cr.top_value IS NULL)
           OR cr.top_value = $3::int
         )
       ORDER BY cr.id ASC
       LIMIT 1`,
      [challengeId, type, topValue || null]
    );
    return result.rows[0];
  },

  update: async (id, { badgeId, type, topValue, xpReward }) => {
    const result = await pool.query(
      `UPDATE challenge_reward SET
        badge_id = $1,
        type = $2,
        top_value = $3,
        xp_reward = $4
       WHERE id = $5
       RETURNING *`,
      [badgeId || null, type, topValue || null, xpReward || 0, id]
    );
    return result.rows[0];
  },

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      `DELETE FROM challenge_reward WHERE challenge_id = $1`,
      [challengeId]
    );
  },

};

module.exports = challengeRewardModel;
