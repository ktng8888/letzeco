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

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      `DELETE FROM challenge_reward WHERE challenge_id = $1`,
      [challengeId]
    );
  },

};

module.exports = challengeRewardModel;