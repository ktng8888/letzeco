const pool = require('../config/db');

const actionModel = {

  getAll: async () => {
    const result = await pool.query(
      `SELECT a.*,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code
      FROM action a
      LEFT JOIN action_category ac ON a.action_category_id = ac.id
      ORDER BY a.id ASC`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT a.*,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code
      FROM action a
      LEFT JOIN action_category ac ON a.action_category_id = ac.id
      WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  getByCategory: async (categoryId) => {
    const result = await pool.query(
      `SELECT a.*,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code
      FROM action a
      LEFT JOIN action_category ac ON a.action_category_id = ac.id
      WHERE a.action_category_id = $1
      ORDER BY a.id ASC`,
      [categoryId]
    );
    return result.rows;
  },

  getPopular: async () => {
    const result = await pool.query(
      `SELECT a.*,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              COUNT(ua.id) AS global_log_count
      FROM action a
      LEFT JOIN action_category ac ON a.action_category_id = ac.id
      LEFT JOIN user_action ua ON a.id = ua.action_id
        AND ua.status = 'completed'
      GROUP BY a.id, ac.name,
                ac.tag_bg_colour_code, ac.tag_text_colour_code
      ORDER BY global_log_count DESC
      LIMIT 5`
    );
    return result.rows;
  },

  getRecommended: async (userId) => {
    const result = await pool.query(
      `SELECT a.*,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code
      FROM action a
      LEFT JOIN action_category ac ON a.action_category_id = ac.id
      WHERE a.id NOT IN (
        SELECT DISTINCT action_id FROM user_action
        WHERE user_id = $1 AND status = 'completed'
      )
      ORDER BY RANDOM()
      LIMIT 8`,
      [userId]
    );
    return result.rows;
  },

  // Create action
  create: async (data) => {
    const {
      name,
      action_category_id,
      image,
      time_limit,
      description,
      importance,
      xp_reward,
      co2_saved,
      litre_saved,
      kwh_saved,
      calc_info,
      source
    } = data;

    const result = await pool.query(
      `INSERT INTO action (
        name, action_category_id, image,
        time_limit, description, importance, xp_reward,
        co2_saved, litre_saved, kwh_saved,
        calc_info, source
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        name, action_category_id, image || null,
        time_limit || null, description || null,
        importance || null, xp_reward || 10,
        co2_saved || null, litre_saved || null,
        kwh_saved || null, calc_info || null, source || null
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM action WHERE id = $1', [id]
    );
    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE action SET
        name = $1, action_category_id = $2,
        image = $3, time_limit = $4,
        description = $5, importance = $6,
        xp_reward = $7, co2_saved = $8,
        litre_saved = $9, kwh_saved = $10,
        calc_info = $11, source = $12
      WHERE id = $13
      RETURNING *`,
      [
        data.name || current.name,
        data.action_category_id || current.action_category_id,
        data.image || current.image,
        data.time_limit || current.time_limit,
        data.description || current.description,
        data.importance || current.importance,
        data.xp_reward || current.xp_reward,
        data.co2_saved || current.co2_saved,
        data.litre_saved || current.litre_saved,
        data.kwh_saved || current.kwh_saved,
        data.calc_info || current.calc_info,
        data.source || current.source,
        id
      ]
    );
    return result.rows[0];
  },

  // Delete action
  delete: async (id) => {
    await pool.query(
      'DELETE FROM action WHERE id = $1', [id]
    );
  },

};

module.exports = actionModel;