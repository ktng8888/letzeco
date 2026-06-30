const pool = require('../config/db');

let lastSyncAt = 0;

const syncWeeklyXp = async ({ force = false } = {}) => {
  const now = Date.now();
  if (!force && now - lastSyncAt < 60 * 1000) return;

  await pool.query(`
    WITH bounds AS (
      SELECT
        date_trunc('week', NOW()) AS week_start,
        date_trunc('week', NOW()) + INTERVAL '7 days' AS week_end
    ),
    xp_events AS (
      SELECT
        ua.user_id,
        ua.end_time AS earned_at,
        COALESCE(ua.xp_gained, 0)::integer AS xp
      FROM user_action ua
      WHERE ua.status = 'completed'
        AND ua.end_time IS NOT NULL

      UNION ALL

      SELECT
        ua.user_id,
        ua.achieve_date AS earned_at,
        COALESCE(a.bonus_xp, 0)::integer AS xp
      FROM user_achievement ua
      JOIN achievement a ON a.id = ua.achievement_id
      WHERE ua.achieve_date IS NOT NULL

      UNION ALL

      SELECT
        usr.user_id,
        COALESCE(usr.claimed_date, usr.obtain_date) AS earned_at,
        COALESCE(usr.xp_reward, sr.xp_reward, 0)::integer AS xp
      FROM user_streak_reward usr
      LEFT JOIN streak_reward sr ON sr.id = usr.streak_reward_id
      WHERE usr.status = 'claimed'
        AND COALESCE(usr.claimed_date, usr.obtain_date) IS NOT NULL

      UNION ALL

      SELECT
        ucr.user_id,
        COALESCE(ucr.claimed_date, ucr.obtain_date) AS earned_at,
        COALESCE(cr.xp_reward, 0)::integer AS xp
      FROM user_challenge_reward ucr
      JOIN challenge_reward cr ON cr.id = ucr.challenge_reward_id
      WHERE ucr.status = 'claimed'
        AND COALESCE(ucr.claimed_date, ucr.obtain_date) IS NOT NULL
    ),
    weekly_totals AS (
      SELECT
        u.id,
        COALESCE(SUM(e.xp), 0)::integer AS weekly_xp
      FROM "user" u
      CROSS JOIN bounds b
      LEFT JOIN xp_events e
        ON e.user_id = u.id
       AND e.earned_at >= b.week_start
       AND e.earned_at < b.week_end
      GROUP BY u.id
    ),
    historical_weekly AS (
      SELECT
        user_id,
        date_trunc('week', earned_at) AS week_start,
        SUM(xp)::integer AS weekly_xp
      FROM xp_events
      GROUP BY user_id, date_trunc('week', earned_at)
    ),
    best_totals AS (
      SELECT user_id AS id, MAX(weekly_xp)::integer AS best_weekly_xp
      FROM historical_weekly
      GROUP BY user_id
    )
    UPDATE "user" u
    SET weekly_xp = wt.weekly_xp,
        best_weekly_xp = GREATEST(
          COALESCE(u.best_weekly_xp, 0),
          wt.weekly_xp,
          COALESCE(bt.best_weekly_xp, 0)
        )
    FROM weekly_totals wt
    LEFT JOIN best_totals bt ON bt.id = wt.id
    WHERE wt.id = u.id
  `);

  lastSyncAt = now;
};

module.exports = {
  syncWeeklyXp,
};
