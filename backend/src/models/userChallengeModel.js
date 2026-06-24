// backend/src/models/userChallengeModel.js
const pool = require('../config/db');

const normalizeProgress = (value) => {
  const num = parseFloat(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const userChallengeModel = {

  // Get user challenge by user_id and challenge_id
  getByUserAndChallenge: async (userId, challengeId) => {
    const result = await pool.query(
      `SELECT uc.*,
              ROUND(COALESCE(uc.progress_value, 0)::numeric, 2) AS progress_value,
              COALESCE(
                uc.status,
                CASE
                  WHEN c.target_value IS NOT NULL
                   AND uc.progress_value >= c.target_value THEN 'completed'
                  ELSE 'active'
                END
              ) AS status
       FROM user_challenge uc
       LEFT JOIN challenge c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1 AND uc.challenge_id = $2`,
      [userId, challengeId]
    );
    return result.rows[0];
  },

  // Get all challenges user is participating in
  getMyChallenge: async (userId) => {
    const result = await pool.query(
      `SELECT uc.*, c.name AS challenge_name,
              ROUND(COALESCE(uc.progress_value, 0)::numeric, 2) AS progress_value,
              c.image AS challenge_image,
              c.type, c.start_date, c.end_date,
              c.about, c.target_type, c.target_value,
              COALESCE(
                uc.status,
                CASE
                  WHEN c.target_value IS NOT NULL
                   AND uc.progress_value >= c.target_value THEN 'completed'
                  ELSE 'active'
                END
              ) AS status,
              c.status AS challenge_status
       FROM user_challenge uc
       LEFT JOIN challenge c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.id DESC`,
      [userId]
    );
    return result.rows;
  },

  // Join a challenge
  create: async (userId, challengeId, teamId) => {
    const result = await pool.query(
      `INSERT INTO user_challenge
        (user_id, challenge_id, progress_value, team_id, status, joined_at)
       VALUES ($1, $2, 0, $3, 'active', NOW())
       RETURNING *`,
      [userId, challengeId, teamId || null]
    );
    return result.rows[0];
  },

  // Leave a challenge
  delete: async (userId, challengeId) => {
    await pool.query(
      `DELETE FROM user_challenge
       WHERE user_id = $1 AND challenge_id = $2`,
      [userId, challengeId]
    );
  },

  deleteByChallengeId: async (challengeId) => {
    await pool.query(
      'DELETE FROM user_challenge WHERE challenge_id = $1', [challengeId]
    );
  },

  // Update progress value and keep the participation status in sync.
  updateProgress: async (userId, challengeId, progressValue, status = 'active') => {
    const normalizedProgress = normalizeProgress(progressValue);
    const result = await pool.query(
      `UPDATE user_challenge
       SET progress_value = $1,
           status = $2
       WHERE user_id = $3 AND challenge_id = $4
       RETURNING *`,
      [normalizedProgress, status, userId, challengeId]
    );
    return result.rows[0];
  },

  updateStatus: async (userId, challengeId, status) => {
    const result = await pool.query(
      `UPDATE user_challenge
       SET status = $1,
           completion_time = CASE
             WHEN $1 = 'completed' AND completion_time IS NULL THEN NOW()
             ELSE completion_time
           END
       WHERE user_id = $2 AND challenge_id = $3
       RETURNING *`,
      [status, userId, challengeId]
    );
    return result.rows[0];
  },

  markCompletionTime: async (userId, challengeId) => {
    const result = await pool.query(
      `UPDATE user_challenge
       SET completion_time = COALESCE(completion_time, NOW())
       WHERE user_id = $1 AND challenge_id = $2
       RETURNING *`,
      [userId, challengeId]
    );
    return result.rows[0];
  },

  updateTeamStatus: async (teamId, challengeId, status) => {
    const result = await pool.query(
      `UPDATE user_challenge
       SET status = $1,
           completion_time = CASE
             WHEN $1 = 'completed' AND completion_time IS NULL THEN NOW()
             ELSE completion_time
           END
       WHERE team_id = $2 AND challenge_id = $3
       RETURNING *`,
      [status, teamId, challengeId]
    );
    return result.rows;
  },

  markTeamCompletionTime: async (teamId, challengeId) => {
    const result = await pool.query(
      `UPDATE user_challenge
       SET completion_time = COALESCE(completion_time, NOW())
       WHERE team_id = $1 AND challenge_id = $2
       RETURNING *`,
      [teamId, challengeId]
    );
    return result.rows;
  },

  // Get team progress for a challenge
  getTeamProgress: async (teamId, challengeId) => {
    const result = await pool.query(
      `WITH team_users AS (
         SELECT leader_user_id AS user_id
         FROM team
         WHERE id = $1
         UNION
         SELECT user_id
         FROM team_member
         WHERE team_id = $1
       )
       SELECT ROUND(COALESCE(SUM(uc.progress_value), 0)::numeric, 2) AS total_progress
       FROM team_users tu
       LEFT JOIN user_challenge uc
         ON uc.user_id = tu.user_id
        AND uc.team_id = $1
        AND uc.challenge_id = $2`,
      [teamId, challengeId]
    );
    return parseFloat(result.rows[0].total_progress) || 0;
  },

  // Get participants count for a challenge
  getParticipantsCount: async (challengeId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_challenge
       WHERE challenge_id = $1`,
      [challengeId]
    );
    return parseInt(result.rows[0].count);
  },

  // ── NEW: Get all active challenges that a user is participating in
  //         and that include the given action as eligible
  getActiveForUserAndAction: async (userId, actionId, actionStartTime) => {
    const result = await pool.query(
      `SELECT uc.*, c.target_type, c.target_value, c.type,
              ROUND(COALESCE(uc.progress_value, 0)::numeric, 2) AS progress_value,
              c.name AS challenge_name,
              COALESCE(
                uc.status,
                CASE
                  WHEN uc.progress_value >= c.target_value THEN 'completed'
                  ELSE 'active'
                END
              ) AS user_challenge_status
       FROM user_challenge uc
       JOIN challenge c ON uc.challenge_id = c.id
       JOIN eligible_action ea ON ea.challenge_id = c.id
       WHERE uc.user_id = $1
         AND ea.action_id = $2
         AND c.status = 'active'
         AND COALESCE(uc.status, 'active') IN ('active', 'completed')
         AND CURRENT_DATE BETWEEN c.start_date AND c.end_date
         AND $3::timestamptz >= COALESCE(uc.joined_at, c.start_date::timestamptz)`,
      [userId, actionId, actionStartTime]
    );
    return result.rows;
  },

  // Get solo rankings for a challenge (top N participants by progress)
  getSoloRankings: async (challengeId, limit = 5) => {
    const result = await pool.query(
      `SELECT
         uc.user_id,
         u.username,
         u.profile_image,
         ROUND(COALESCE(uc.progress_value, 0)::numeric, 2) AS progress_value,
         uc.completion_time,
         ROW_NUMBER() OVER (
           ORDER BY uc.progress_value DESC, uc.completion_time ASC NULLS LAST
         ) AS rank
       FROM user_challenge uc
       JOIN "user" u ON uc.user_id = u.id
       WHERE uc.challenge_id = $1
       ORDER BY uc.progress_value DESC, uc.completion_time ASC NULLS LAST
       LIMIT $2`,
      [challengeId, limit]
    );
    return result.rows;
  },

  // Get team rankings for a challenge (top N teams by combined progress)
  getTeamRankings: async (challengeId, limit = 5) => {
    const result = await pool.query(
      `WITH team_users AS (
         SELECT id AS team_id, leader_user_id AS user_id
         FROM team
         WHERE challenge_id = $1
         UNION
         SELECT tm.team_id, tm.user_id
         FROM team_member tm
         JOIN team t ON t.id = tm.team_id
         WHERE t.challenge_id = $1
       ),
       team_scores AS (
         SELECT
           t.id AS team_id,
           t.name AS team_name,
           ROUND(COALESCE(SUM(uc.progress_value), 0)::numeric, 2) AS team_progress,
           COUNT(DISTINCT tu.user_id) AS member_count,
           MIN(uc.completion_time) AS team_completion_time
         FROM team t
         LEFT JOIN team_users tu
           ON tu.team_id = t.id
         LEFT JOIN user_challenge uc
           ON uc.team_id = t.id
          AND uc.challenge_id = t.challenge_id
          AND uc.user_id = tu.user_id
         WHERE t.challenge_id = $1
         GROUP BY t.id, t.name
       )
       SELECT
         team_id,
         team_name,
         team_progress,
         member_count,
         team_completion_time,
         ROW_NUMBER() OVER (
           ORDER BY team_progress DESC, team_completion_time ASC NULLS LAST
         ) AS rank
       FROM team_scores
       ORDER BY team_progress DESC, team_completion_time ASC NULLS LAST
       LIMIT $2`,
      [challengeId, limit]
    );
    return result.rows;
  },

  // Get the user's own rank in a challenge (solo)
  getUserRank: async (userId, challengeId) => {
    const result = await pool.query(
      `SELECT rank FROM (
         SELECT user_id,
                ROW_NUMBER() OVER (
                  ORDER BY progress_value DESC, completion_time ASC NULLS LAST
                ) AS rank
         FROM user_challenge
         WHERE challenge_id = $1
       ) ranked
       WHERE user_id = $2`,
      [challengeId, userId]
    );
    return result.rows[0]?.rank || null;
  },

  // Get user's team rank in a challenge (team)
  getTeamRank: async (teamId, challengeId) => {
    const result = await pool.query(
      `WITH team_users AS (
         SELECT id AS team_id, leader_user_id AS user_id
         FROM team
         WHERE challenge_id = $1
         UNION
         SELECT tm.team_id, tm.user_id
         FROM team_member tm
         JOIN team t ON t.id = tm.team_id
         WHERE t.challenge_id = $1
       ),
       team_scores AS (
         SELECT
           t.id AS team_id,
           ROUND(COALESCE(SUM(uc.progress_value), 0)::numeric, 2) AS team_progress,
           MIN(uc.completion_time) AS team_completion_time
         FROM team t
         LEFT JOIN team_users tu
           ON tu.team_id = t.id
         LEFT JOIN user_challenge uc
           ON uc.team_id = t.id
          AND uc.challenge_id = t.challenge_id
          AND uc.user_id = tu.user_id
         WHERE t.challenge_id = $1
         GROUP BY t.id
       )
       SELECT rank FROM (
         SELECT
           team_id,
           ROW_NUMBER() OVER (
             ORDER BY team_progress DESC,
                      team_completion_time ASC NULLS LAST
           ) AS rank
         FROM team_scores
       ) ranked
       WHERE team_id = $2`,
      [challengeId, teamId]
    );
    return result.rows[0]?.rank || null;
  },

};

module.exports = userChallengeModel;
