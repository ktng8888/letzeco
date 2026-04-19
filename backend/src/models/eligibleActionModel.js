const pool = require('../config/db');

const eligibleActionModel = {

  // Get all eligible actions for a challenge
  getByChallengeId: async (challengeId) => {
    const result = await pool.query(
      `SELECT ea.*, a.name AS action_name,
              ac.name AS category_name
       FROM eligible_action ea
       LEFT JOIN action a ON ea.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ea.challenge_id = $1`,
      [challengeId]
    );
    return result.rows;
  },

  // Add eligible action to challenge
  create: async (action_id, challenge_id) => {
    const result = await pool.query(
      `INSERT INTO eligible_action (action_id, challenge_id)
       VALUES ($1, $2) RETURNING *`,
      [action_id, challenge_id]
    );
    return result.rows[0];
  },

  // Remove eligible action from challenge
  delete: async (id) => {
    await pool.query(
      'DELETE FROM eligible_action WHERE id = $1', [id]
    );
  },

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      'DELETE FROM eligible_action WHERE challenge_id = $1',
      [challengeId]
    );
  },

  // Check if action already eligible for challenge
  checkExists: async (action_id, challenge_id) => {
    const result = await pool.query(
      `SELECT * FROM eligible_action
       WHERE action_id = $1 AND challenge_id = $2`,
      [action_id, challenge_id]
    );
    return result.rows[0];
  },

};

module.exports = eligibleActionModel;