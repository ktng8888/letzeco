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
    weekly_totals AS (
      SELECT
        u.id,
        (
          COALESCE((
            SELECT SUM(ua.xp_gained)
            FROM user_action ua, bounds b
            WHERE ua.user_id = u.id
              AND ua.status = 'completed'
              AND ua.end_time >= b.week_start
              AND ua.end_time < b.week_end
          ), 0)
          +
          COALESCE((
            SELECT SUM(a.bonus_xp)
            FROM user_achievement ua
            JOIN achievement a ON a.id = ua.achievement_id
            CROSS JOIN bounds b
            WHERE ua.user_id = u.id
              AND ua.achieve_date >= b.week_start
              AND ua.achieve_date < b.week_end
          ), 0)
          +
          COALESCE((
            SELECT SUM(COALESCE(usr.xp_reward, sr.xp_reward, 0))
            FROM user_streak_reward usr
            LEFT JOIN streak_reward sr ON sr.id = usr.streak_reward_id
            CROSS JOIN bounds b
            WHERE usr.user_id = u.id
              AND usr.status = 'claimed'
              AND COALESCE(usr.claimed_date, usr.obtain_date) >= b.week_start
              AND COALESCE(usr.claimed_date, usr.obtain_date) < b.week_end
          ), 0)
          +
          COALESCE((
            SELECT SUM(cr.xp_reward)
            FROM user_challenge_reward ucr
            JOIN challenge_reward cr ON cr.id = ucr.challenge_reward_id
            CROSS JOIN bounds b
            WHERE ucr.user_id = u.id
              AND ucr.status = 'claimed'
              AND COALESCE(ucr.claimed_date, ucr.obtain_date) >= b.week_start
              AND COALESCE(ucr.claimed_date, ucr.obtain_date) < b.week_end
          ), 0)
        )::integer AS weekly_xp
      FROM "user" u
    )
    UPDATE "user" u
    SET weekly_xp = wt.weekly_xp
    FROM weekly_totals wt
    WHERE wt.id = u.id
  `);

  lastSyncAt = now;
};

module.exports = {
  syncWeeklyXp,
};
