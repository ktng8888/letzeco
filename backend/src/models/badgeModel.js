const pool = require('../config/db');

const badgeModel = {

  getAll: async () => {
    const result = await pool.query(
      'SELECT * FROM badge ORDER BY id ASC'
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM badge WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  create: async (name, image) => {
    const result = await pool.query(
      `INSERT INTO badge (name, image)
       VALUES ($1, $2) RETURNING *`,
      [name, image || null]
    );
    return result.rows[0];
  },

  update: async (id, name, image) => {
    const result = await pool.query(
      `UPDATE badge SET name = $1, image = $2
       WHERE id = $3 RETURNING *`,
      [name, image, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM badge WHERE id = $1', [id]);
  },

};

module.exports = badgeModel;