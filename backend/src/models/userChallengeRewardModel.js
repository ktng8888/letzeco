const pool = require('../config/db');

const userChallengeRewardModel = {

  // Check if user already received a reward
  checkExists: async (userId, challengeRewardId) => {
    const result = await pool.query(
      `SELECT * FROM user_challenge_reward
       WHERE user_id = $1
       AND challenge_reward_id = $2`,
      [userId, challengeRewardId]
    );
    return result.rows[0];
  },

  // Give reward to user
  create: async (userId, challengeRewardId) => {
    const result = await pool.query(
      `INSERT INTO user_challenge_reward
        (user_id, challenge_reward_id, obtain_date)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, challengeRewardId]
    );
    return result.rows[0];
  },

};

module.exports = userChallengeRewardModel;