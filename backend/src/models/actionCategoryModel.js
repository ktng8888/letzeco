const pool = require('../config/db');

const actionCategoryModel = {

  // Get all categories
  getAll: async () => {
    const result = await pool.query(
      'SELECT * FROM action_category ORDER BY id ASC'
    );
    return result.rows;
  },

  // Get single category by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM action_category WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const {
      name, description,
      tag_bg_colour_code, tag_text_colour_code
    } = data;
    const result = await pool.query(
      `INSERT INTO action_category
        (name, description, tag_bg_colour_code, tag_text_colour_code)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name, description || null,
        tag_bg_colour_code || null,
        tag_text_colour_code || null
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM action_category WHERE id = $1', [id]
    );
    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE action_category SET
        name = $1,
        description = $2,
        tag_bg_colour_code = $3,
        tag_text_colour_code = $4
       WHERE id = $5
       RETURNING *`,
      [
        data.name || current.name,
        data.description || current.description,
        data.tag_bg_colour_code !== undefined
          ? data.tag_bg_colour_code
          : current.tag_bg_colour_code,
        data.tag_text_colour_code !== undefined
          ? data.tag_text_colour_code
          : current.tag_text_colour_code,
        id
      ]
    );
    return result.rows[0];
  },

  // Delete category
  delete: async (id) => {
    await pool.query(
      'DELETE FROM action_category WHERE id = $1',
      [id]
    );
  },

};

module.exports = actionCategoryModel;