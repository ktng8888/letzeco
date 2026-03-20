const pool = require('../config/db');

const challengeRewardModel = {

  // Get rewards for a challenge
  getByChallengeId: async (challengeId) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1`,
      [challengeId]
    );
    return result.rows;
  },

  // Get completion reward for challenge
  getCompletionReward: async (challengeId) => {
    const result = await pool.query(
      `SELECT cr.*, b.name AS badge_name, b.image AS badge_image
       FROM challenge_reward cr
       LEFT JOIN badge b ON cr.badge_id = b.id
       WHERE cr.challenge_id = $1
       AND cr.type = 'completion'`,
      [challengeId]
    );
    return result.rows[0];
  },

};

module.exports = challengeRewardModel;