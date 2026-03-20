const pool = require('../config/db');

const achievementModel = {

  getAll: async () => {
    const result = await pool.query(
      `SELECT a.*, b.name AS badge_name,
              ac.name AS category_name
       FROM achievement a
       LEFT JOIN badge b ON a.bagde_id = b.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       ORDER BY a.id ASC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT a.*, b.name AS badge_name,
              ac.name AS category_name
       FROM achievement a
       LEFT JOIN badge b ON a.bagde_id = b.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const {
      name, bagde_id, bonus_xp, type,
      action_category_id, action_id,
      target_type, target_value
    } = data;
    const result = await pool.query(
      `INSERT INTO achievement (
        name, bagde_id, bonus_xp, type,
        action_category_id, action_id,
        target_type, target_value
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        name, bagde_id || null, bonus_xp || 0, type || null,
        action_category_id || null, action_id || null,
        target_type || null, target_value || null
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM achievement WHERE id = $1', [id]
    );
    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE achievement SET
        name = $1, bagde_id = $2, bonus_xp = $3,
        type = $4, action_category_id = $5,
        action_id = $6, target_type = $7, target_value = $8
       WHERE id = $9 RETURNING *`,
      [
        data.name || current.name,
        data.bagde_id || current.bagde_id,
        data.bonus_xp || current.bonus_xp,
        data.type || current.type,
        data.action_category_id || current.action_category_id,
        data.action_id || current.action_id,
        data.target_type || current.target_type,
        data.target_value || current.target_value,
        id
      ]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM achievement WHERE id = $1', [id]);
  },

};

module.exports = achievementModel;