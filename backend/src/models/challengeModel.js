const pool = require('../config/db');

const challengeModel = {

  getAll: async () => {
    const result = await pool.query(
      'SELECT * FROM challenge ORDER BY id ASC'
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM challenge WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const {
      name, image, type, start_date, end_date,
      about, target_type, target_value, status
    } = data;
    const result = await pool.query(
      `INSERT INTO challenge (
        name, image, type, start_date, end_date,
        about, target_type, target_value, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name, image || null, type || 'solo',
        start_date, end_date, about || null,
        target_type || null, target_value || null,
        status || 'active'
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM challenge WHERE id = $1', [id]
    );
    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE challenge SET
        name = $1, image = $2, type = $3,
        start_date = $4, end_date = $5,
        about = $6, target_type = $7,
        target_value = $8, status = $9
       WHERE id = $10 RETURNING *`,
      [
        data.name || current.name,
        data.image || current.image,
        data.type || current.type,
        data.start_date || current.start_date,
        data.end_date || current.end_date,
        data.about || current.about,
        data.target_type || current.target_type,
        data.target_value || current.target_value,
        data.status || current.status,
        id
      ]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM challenge WHERE id = $1', [id]);
  },

};

module.exports = challengeModel;