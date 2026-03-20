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

  // Create category
  create: async (name, image) => {
    const result = await pool.query(
      `INSERT INTO action_category (name, image)
       VALUES ($1, $2)
       RETURNING *`,
      [name, image]
    );
    return result.rows[0];
  },

  // Update category
  update: async (id, name, image) => {
    const result = await pool.query(
      `UPDATE action_category
       SET name = $1, image = $2
       WHERE id = $3
       RETURNING *`,
      [name, image, id]
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