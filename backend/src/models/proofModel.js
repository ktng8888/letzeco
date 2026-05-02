const pool = require('../config/db');

const proofModel = {

  // Get proof requirement by action ID
  getByActionId: async (actionId) => {
    const result = await pool.query(
      'SELECT * FROM proof WHERE action_id = $1',
      [actionId]
    );
    return result.rows[0];
  },

  // Get proof by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM proof WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  create: async (actionId, requirement, bonusXp, type) => {
    const result = await pool.query(
      `INSERT INTO proof (action_id, requirement, bonus_xp, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [actionId, requirement, bonusXp, type]
    );
    return result.rows[0];
  },

  update: async (actionId, requirement, bonusXp, type) => {
    const result = await pool.query(
      `UPDATE proof SET requirement = $1, bonus_xp = $2, type = $3
       WHERE action_id = $4 RETURNING *`,
      [requirement, bonusXp, type, actionId]
    );
    return result.rows[0];
  },

  deleteByActionId: async (actionId) => {
    await pool.query('DELETE FROM proof WHERE action_id = $1', [actionId]);
  },

};

module.exports = proofModel;