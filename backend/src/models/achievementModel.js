const pool = require('../config/db');

const achievementModel = {

  getAll: async () => {
    const result = await pool.query(
      `SELECT a.*,
              b.name AS badge_name,
              b.image AS badge_image,
              ac.name AS category_name,
              act.name AS action_name
       FROM achievement a
       LEFT JOIN badge b ON a.badge_id = b.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       LEFT JOIN action act ON a.action_id = act.id
       ORDER BY a.type, a.target_value ASC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT a.*,
              b.name AS badge_name,
              b.image AS badge_image,
              ac.name AS category_name,
              act.name AS action_name
       FROM achievement a
       LEFT JOIN badge b ON a.badge_id = b.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       LEFT JOIN action act ON a.action_id = act.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const {
      name, type, target_value, bonus_xp,
      badge_name, badge_id, action_category_id, action_id
    } = data;
    const result = await pool.query(
      `INSERT INTO achievement
        (name, type, target_value, bonus_xp,
         badge_id, action_category_id, action_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name, type, target_value, bonus_xp,
        badge_id ?? null, action_category_id ?? null, action_id ?? null
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM achievement WHERE id = $1', [id]
    );
    const current = existing.rows[0];
    const has = (field) => Object.prototype.hasOwnProperty.call(data, field);
    const result = await pool.query(
      `UPDATE achievement SET
        name = $1, type = $2,
        target_value = $3, bonus_xp = $4,
        action_category_id = $5,
        action_id = $6
       WHERE id = $7 RETURNING *`,
      [
        has('name') ? data.name : current.name,
        has('type') ? data.type : current.type,
        has('target_value') ? data.target_value : current.target_value,
        has('bonus_xp') ? data.bonus_xp : current.bonus_xp,
        has('action_category_id') ? data.action_category_id : current.action_category_id,
        has('action_id') ? data.action_id : current.action_id,
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
