const pool = require('../config/db');

const levelModel = {

  getByLevel: async (levelValue) => {
    const result = await pool.query(
      'SELECT * FROM level WHERE level_value = $1',
      [levelValue]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query(
      'SELECT * FROM level ORDER BY level_value ASC'
    );
    return result.rows;
  },

};

module.exports = levelModel;