const pool = require('../config/db');

const streakRewardModel = {

  getAll: async () => {
    const result = await pool.query(
      `SELECT sr.*, b.name AS badge_name
       FROM streak_reward sr
       LEFT JOIN badge b ON sr.badge_id = b.id
       ORDER BY sr.day ASC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT sr.*, b.name AS badge_name
       FROM streak_reward sr
       LEFT JOIN badge b ON sr.badge_id = b.id
       WHERE sr.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  getByDay: async (day) => {
    const result = await pool.query(
      'SELECT * FROM streak_reward WHERE day = $1', [day]
    );
    return result.rows[0];
  },

  create: async (bagde_id, day, xp_reward) => {
    const result = await pool.query(
      `INSERT INTO streak_reward (bagde_id, day, xp_reward)
       VALUES ($1, $2, $3) RETURNING *`,
      [bagde_id || null, day, xp_reward || 0]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM streak_reward WHERE id = $1', [id]
    );
    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE streak_reward
       SET bagde_id = $1, day = $2, xp_reward = $3
       WHERE id = $4 RETURNING *`,
      [
        data.bagde_id || current.bagde_id,
        data.day || current.day,
        data.xp_reward || current.xp_reward,
        id
      ]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM streak_reward WHERE id = $1', [id]);
  },

};

module.exports = streakRewardModel;