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

};

module.exports = proofModel;