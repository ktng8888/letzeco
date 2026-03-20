const pool = require('../config/db');

const userProofModel = {

  // Get user proof by user_action id
  getByUserActionId: async (userActionId) => {
    const result = await pool.query(
      `SELECT up.*, p.requirement, p.bonus_xp, p.type
       FROM user_proof up
       LEFT JOIN proof p ON up.proof_id = p.id
       WHERE up.user_action_id = $1`,
      [userActionId]
    );
    return result.rows[0];
  },

  // Create user proof record
  create: async (userId, proofId, userActionId, imagePath) => {
    const result = await pool.query(
      `INSERT INTO user_proof
        (user_id, proof_id, user_action_id, date, status, image)
       VALUES ($1, $2, $3, CURRENT_DATE, 'pending', $4)
       RETURNING *`,
      [userId, proofId, userActionId, imagePath]
    );
    return result.rows[0];
  },

  // Update proof status (after AI validation)
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE user_proof SET status = $1
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  // Get proof by id
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM user_proof WHERE id = $1', [id]
    );
    return result.rows[0];
  },

};

module.exports = userProofModel;