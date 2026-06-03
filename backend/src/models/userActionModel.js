const pool = require('../config/db');

const userActionModel = {

  // Get user log count for specific action
  getUserLogCount: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE user_id = $1 AND action_id = $2
       AND status = 'completed'`,
      [userId, actionId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get global log count for specific action
  getGlobalLogCount: async (actionId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE action_id = $1 AND status = 'completed'`,
      [actionId]
    );
    return parseInt(result.rows[0].count);
  },

  // Check if user is currently logging this action
  getInProgress: async (userId, actionId) => {
    const result = await pool.query(
      `SELECT * FROM user_action
       WHERE user_id = $1 AND action_id = $2
       AND status = 'in_progress'`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Check if user has ANY action in progress
  getAnyInProgress: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.time_limit, a.xp_reward,
              a.description,
              a.co2_saved, a.litre_saved, a.kwh_saved,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              CASE
                WHEN p.id IS NOT NULL THEN json_build_object(
                  'id', p.id,
                  'requirement', p.requirement,
                  'bonus_xp', p.bonus_xp
                )
                ELSE NULL
              END AS proof
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       LEFT JOIN proof p ON p.action_id = a.id
       WHERE ua.user_id = $1
       AND ua.status = 'in_progress'`,
      [userId]
    );
    return result.rows[0];
  },

  // Get today's logged actions for user
  getTodayActions: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.xp_reward, a.time_limit,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              ac.name AS category_name
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.user_id = $1
       AND DATE(ua.end_time) = CURRENT_DATE
       AND ua.status = 'completed'
       ORDER BY ua.end_time DESC`,
      [userId]
    );
    return result.rows;
  },

  getLastCompletedDates: async (userId, limit) => {
    const result = await pool.query(
      `SELECT DATE(end_time) AS last_date
      FROM user_action
      WHERE user_id = $1 AND status = 'completed'
      ORDER BY end_time DESC
      LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  // Get log history for user
  getHistory: async (userId) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.xp_reward,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              ac.name AS category_name
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.user_id = $1
       AND ua.status = 'completed'
       ORDER BY ua.end_time DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get single log by ID
  getById: async (id) => {
    const result = await pool.query(
      `SELECT ua.*, a.name AS action_name,
              a.image AS action_image,
              a.description, a.importance,
              a.xp_reward, a.time_limit,
              a.co2_saved, a.litre_saved, a.kwh_saved,
              a.calc_info, a.source,
              ac.name AS category_name,
              ac.tag_bg_colour_code,
              ac.tag_text_colour_code,
              CASE
                WHEN up.id IS NOT NULL THEN json_build_object(
                  'id', up.id,
                  'requirement', p.requirement,
                  'bonus_xp', p.bonus_xp,
                  'type', p.type,
                  'status', up.status,
                  'image', up.image,
                  'date', up.date
                )
                ELSE NULL
              END AS proof
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       LEFT JOIN user_proof up ON up.user_action_id = ua.id
       LEFT JOIN proof p ON up.proof_id = p.id
       WHERE ua.id = $1`,
      [id]
    );
    return result.rows[0];
  },

    // Get total completed actions count for user
  getTotalCompleted: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get today's completed impact summary for user
  getTodayImpactSummary: async (userId) => {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_actions,
        COALESCE(SUM(xp_gained), 0) AS total_xp_earned,
        COALESCE(SUM(co2_saved), 0) AS total_co2_saved,
        COALESCE(SUM(litre_saved), 0) AS total_litre_saved,
        COALESCE(SUM(kwh_saved), 0) AS total_kwh_saved
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE(end_time) = CURRENT_DATE`,
      [userId]
    );
    return result.rows[0];
  },

  // Get user's eligible actions logged within a challenge's date range
  // Used for the Activity tab bar chart
  getChallengeActivity: async (userId, challengeId) => {
    const result = await pool.query(
      `SELECT
         ua.id,
         ua.end_time,
         ua.co2_saved,
         ua.litre_saved,
         ua.kwh_saved,
         ua.xp_gained,
         a.name        AS action_name,
         a.image       AS action_image,
         ac.name       AS category_name,
         u.id          AS user_id,
         u.username,
         u.profile_image
       FROM user_action ua
       JOIN action a
         ON ua.action_id = a.id
       JOIN action_category ac
         ON a.action_category_id = ac.id
       JOIN "user" u
         ON ua.user_id = u.id
       JOIN eligible_action ea
         ON ea.action_id = ua.action_id
         AND ea.challenge_id = $2
       JOIN challenge c ON c.id = $2
       WHERE ua.user_id = $1
         AND ua.status = 'completed'
         AND ua.end_time BETWEEN c.start_date AND c.end_date + INTERVAL '1 day'
       ORDER BY ua.end_time DESC`,
      [userId, challengeId]
    );
    return result.rows;
  },

  // Get all eligible actions logged by all members of a team for a challenge
  getTeamChallengeActivity: async (teamId, challengeId) => {
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
      SELECT
        ua.id,
        ua.end_time,
        ua.co2_saved,
        ua.litre_saved,
        ua.kwh_saved,
        ua.xp_gained,
        a.name        AS action_name,
        a.image       AS action_image,
        ac.name       AS category_name,
        u.id          AS user_id,
        u.username,
        u.profile_image
      FROM user_action ua
      JOIN action a           ON ua.action_id = a.id
      JOIN action_category ac ON a.action_category_id = ac.id
      JOIN "user" u           ON ua.user_id = u.id
      JOIN team_users tu      ON tu.user_id = ua.user_id
      JOIN eligible_action ea ON ea.action_id = ua.action_id AND ea.challenge_id = $2
      JOIN challenge c        ON c.id = $2
      WHERE ua.status = 'completed'
        AND ua.end_time BETWEEN c.start_date AND c.end_date + INTERVAL '1 day'
      ORDER BY ua.end_time DESC`,
      [teamId, challengeId]
    );
    return result.rows;
  },

  // Start logging an action
  create: async (userId, actionId) => {
    const result = await pool.query(
      `INSERT INTO user_action
        (user_id, action_id, status, start_time)
       VALUES ($1, $2, 'in_progress', NOW())
       RETURNING *`,
      [userId, actionId]
    );
    return result.rows[0];
  },

  // Complete an action
  complete: async (id, xpGained, co2Saved, litreSaved, kwhSaved) => {
    const result = await pool.query(
      `UPDATE user_action SET
        status = 'completed',
        end_time = NOW(),
        xp_gained = $1,
        co2_saved = $2,
        litre_saved = $3,
        kwh_saved = $4
       WHERE id = $5
       RETURNING *`,
      [xpGained, co2Saved, litreSaved, kwhSaved, id]
    );
    return result.rows[0];
  },

  cancel: async (id) => {
    /*
    await pool.query(
      `UPDATE user_action SET
        status = 'cancelled',
        end_time = NOW()
       WHERE id = $1`,
      [id]
    );
    */

    await pool.query(
      `DELETE FROM user_action WHERE id = $1`,
      [id]
    );
  },

  cancelExpiredInProgressForUser: async (userId) => {
    /*
    const result = await pool.query(
      `UPDATE user_action ua SET
        status = 'cancelled',
        end_time = NOW()
       FROM action a
       WHERE ua.action_id = a.id
       AND ua.user_id = $1
       AND ua.status = 'in_progress'
       AND a.time_limit IS NOT NULL
       AND ua.start_time + a.time_limit <= NOW()
       RETURNING ua.*`,
      [userId]
    );
    */

    const result = await pool.query(
      `DELETE FROM user_action ua
       USING action a
       WHERE ua.action_id = a.id
       AND ua.user_id = $1
       AND ua.status = 'in_progress'
       AND a.time_limit IS NOT NULL
       AND ua.start_time + a.time_limit <= NOW()
       RETURNING ua.*`,
      [userId]
    );
    return result.rows;
  },

  cancelExpiredInProgress: async () => {
    /*
    const result = await pool.query(
      `UPDATE user_action ua SET
        status = 'cancelled',
        end_time = NOW()
       FROM action a
       WHERE ua.action_id = a.id
       AND ua.status = 'in_progress'
       AND a.time_limit IS NOT NULL
       AND ua.start_time + a.time_limit <= NOW()
       RETURNING ua.*`
    );
    */

    const result = await pool.query(
      `DELETE FROM user_action ua
       USING action a
       WHERE ua.action_id = a.id
       AND ua.status = 'in_progress'
       AND a.time_limit IS NOT NULL
       AND ua.start_time + a.time_limit <= NOW()
       RETURNING ua.*`
    );
    return result.rows;
  },

};

module.exports = userActionModel;
