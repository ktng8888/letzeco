// backend/src/models/challengeModel.js  (FULL REPLACEMENT)
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
      about, target_type, target_value, unit, status
    } = data;
    const result = await pool.query(
      `INSERT INTO challenge (
        name, image, type, start_date, end_date,
        about, target_type, target_value, unit, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        name, image || null, type || 'solo',
        start_date, end_date, about || null,
        target_type || null, target_value || null,
        unit || null, status || 'active'
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const existing = await pool.query(
      'SELECT * FROM challenge WHERE id = $1', [id]
    );
    const current = existing.rows[0];

    let imageValue;
    if (data.remove_image === 'true') {
      imageValue = null;
    } else if (data.image !== undefined) {
      imageValue = data.image;
    } else {
      imageValue = current.image;
    }

    const result = await pool.query(
      `UPDATE challenge SET
        name = $1, image = $2, type = $3,
        start_date = $4, end_date = $5,
        about = $6, target_type = $7,
        target_value = $8, unit = $9, status = $10
       WHERE id = $11 RETURNING *`,
      [
        data.name         || current.name,
        imageValue,
        data.type         || current.type,
        data.start_date   || current.start_date,
        data.end_date     || current.end_date,
        data.about        || current.about,
        data.target_type  || current.target_type,
        data.target_value || current.target_value,
        data.unit !== undefined ? data.unit : current.unit,
        data.status       || current.status,
        id
      ]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM challenge WHERE id = $1', [id]);
  },

  // Get active challenges whose end_date has passed
  getExpiredActive: async () => {
    const result = await pool.query(
      `SELECT * FROM challenge
       WHERE status = 'active' AND end_date < CURRENT_DATE`
    );
    return result.rows;
  },

  // Solo challenge rankings
  getSoloRankings: async (challengeId) => {
    const result = await pool.query(
      `SELECT user_id, progress_value,
              ROW_NUMBER() OVER (ORDER BY progress_value DESC) AS rank
       FROM user_challenge
       WHERE challenge_id = $1`,
      [challengeId]
    );
    return result.rows;
  },

  // Team challenge rankings
  getTeamRankings: async (challengeId) => {
    const result = await pool.query(
      `SELECT uc.user_id, uc.team_id,
              SUM(uc.progress_value) OVER (PARTITION BY uc.team_id) AS team_progress,
              DENSE_RANK() OVER (
                ORDER BY SUM(uc.progress_value) OVER (PARTITION BY uc.team_id) DESC
              ) AS rank
       FROM user_challenge uc
       WHERE uc.challenge_id = $1`,
      [challengeId]
    );
    return result.rows;
  },

  // Mark a challenge as completed
  markCompleted: async (id) => {
    await pool.query(
      `UPDATE challenge SET status = 'completed' WHERE id = $1`, [id]
    );
  },

};

module.exports = challengeModel;