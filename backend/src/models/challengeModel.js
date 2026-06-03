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

  // Get active challenges that should be closed by the nightly completion job.
  getExpiredActive: async () => {
    const result = await pool.query(
      `SELECT * FROM challenge
       WHERE status = 'active' AND end_date <= CURRENT_DATE`
    );
    return result.rows;
  },

  // Solo challenge rankings
  getSoloRankings: async (challengeId) => {
    const result = await pool.query(
      `SELECT user_id, progress_value, completion_time,
              ROW_NUMBER() OVER (
                ORDER BY progress_value DESC, completion_time ASC NULLS LAST
              ) AS rank
       FROM user_challenge uc
       JOIN challenge c ON c.id = uc.challenge_id
       WHERE uc.challenge_id = $1
         AND COALESCE(
               uc.status,
               CASE
                 WHEN uc.progress_value >= c.target_value THEN 'completed'
                 ELSE 'active'
               END
             ) = 'completed'`,
      [challengeId]
    );
    return result.rows;
  },

  // Team challenge rankings
  getTeamRankings: async (challengeId) => {
    const result = await pool.query(
      `WITH completed_teams AS (
         SELECT
           uc.team_id,
           SUM(uc.progress_value) AS team_progress,
           MIN(uc.completion_time) AS team_completion_time,
           ROW_NUMBER() OVER (
             ORDER BY SUM(uc.progress_value) DESC,
                      MIN(uc.completion_time) ASC NULLS LAST
           ) AS rank
         FROM user_challenge uc
         JOIN challenge c ON c.id = uc.challenge_id
         WHERE uc.challenge_id = $1
           AND uc.team_id IS NOT NULL
         GROUP BY uc.team_id, c.target_value
         HAVING SUM(uc.progress_value) >= c.target_value
       )
       SELECT
         uc.user_id,
         uc.team_id,
         ct.team_progress,
         ct.team_completion_time,
         ct.rank
       FROM completed_teams ct
       JOIN user_challenge uc
         ON uc.team_id = ct.team_id
        AND uc.challenge_id = $1
       ORDER BY ct.rank ASC, ct.team_progress DESC,
                ct.team_completion_time ASC NULLS LAST, uc.user_id ASC`,
      [challengeId]
    );
    return result.rows;
  },

  // Expired challenges are no longer joinable/editable as active challenges.
  markInactive: async (id) => {
    await pool.query(
      `UPDATE challenge SET status = 'inactive' WHERE id = $1`, [id]
    );
  },

};

module.exports = challengeModel;
