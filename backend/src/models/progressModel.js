const pool = require('../config/db');

const progressModel = {

  // Get environmental impact for user
  getEnvironmentalImpact: async (userId, period) => {
    let dateFilter = '';

    if (period === 'today') {
      dateFilter = `AND DATE(ua.end_time) = CURRENT_DATE`;
    } else if (period === 'this_week') {
      dateFilter = `AND DATE_TRUNC('week', ua.end_time) =
                    DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'this_month') {
      dateFilter = `AND DATE_TRUNC('month', ua.end_time) =
                    DATE_TRUNC('month', CURRENT_DATE)`;
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(ua.co2_saved), 0) AS total_co2_saved,
        COALESCE(SUM(ua.litre_saved), 0) AS total_litre_saved,
        COALESCE(SUM(ua.kwh_saved), 0) AS total_kwh_saved,
        COALESCE(SUM(ua.xp_gained), 0) AS total_xp_earned,
        COUNT(ua.id) AS total_actions
       FROM user_action ua
       WHERE ua.user_id = $1
       AND ua.status = 'completed'
       ${dateFilter}`,
      [userId]
    );
    return result.rows[0];
  },

  // Get weekly activity (actions per day this week)
  getWeeklyActivity: async (userId) => {
    const result = await pool.query(
      `SELECT
        TO_CHAR(DATE_TRUNC('day', end_time), 'Dy') AS day,
        COUNT(*) AS action_count
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE_TRUNC('week', end_time) =
           DATE_TRUNC('week', CURRENT_DATE)
       GROUP BY DATE_TRUNC('day', end_time)
       ORDER BY DATE_TRUNC('day', end_time) ASC`,
      [userId]
    );
    return result.rows;
  },

  // Get category breakdown
  getCategoryBreakdown: async (userId, period) => {
    let dateFilter = '';

    if (period === 'today') {
      dateFilter = `AND DATE(ua.end_time) = CURRENT_DATE`;
    } else if (period === 'this_week') {
      dateFilter = `AND DATE_TRUNC('week', ua.end_time) =
                    DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'this_month') {
      dateFilter = `AND DATE_TRUNC('month', ua.end_time) =
                    DATE_TRUNC('month', CURRENT_DATE)`;
    }

    const result = await pool.query(
      `SELECT
        ac.name AS category_name,
        COUNT(ua.id) AS action_count,
        ROUND(
          COUNT(ua.id) * 100.0 /
          NULLIF(SUM(COUNT(ua.id)) OVER(), 0), 1
        ) AS percentage
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN action_category ac ON a.action_category_id = ac.id
       WHERE ua.user_id = $1
       AND ua.status = 'completed'
       ${dateFilter}
       GROUP BY ac.name
       ORDER BY action_count DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get comparison (this week vs last week)
  getWeekComparison: async (userId) => {
    const thisWeek = await pool.query(
      `SELECT COUNT(*) AS action_count,
              COALESCE(SUM(xp_gained), 0) AS xp_earned
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE_TRUNC('week', end_time) =
           DATE_TRUNC('week', CURRENT_DATE)`,
      [userId]
    );

    const lastWeek = await pool.query(
      `SELECT COUNT(*) AS action_count,
              COALESCE(SUM(xp_gained), 0) AS xp_earned
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE_TRUNC('week', end_time) =
           DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'`,
      [userId]
    );

    return {
      this_week: thisWeek.rows[0],
      last_week: lastWeek.rows[0]
    };
  },

  // Get month comparison (this month vs last month)
  getMonthComparison: async (userId) => {
    const thisMonth = await pool.query(
      `SELECT COUNT(*) AS action_count,
              COALESCE(SUM(xp_gained), 0) AS xp_earned
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE_TRUNC('month', end_time) =
           DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    const lastMonth = await pool.query(
      `SELECT COUNT(*) AS action_count,
              COALESCE(SUM(xp_gained), 0) AS xp_earned
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND DATE_TRUNC('month', end_time) =
           DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'`,
      [userId]
    );

    return {
      this_month: thisMonth.rows[0],
      last_month: lastMonth.rows[0]
    };
  },

  // Get 6 month trend
  getSixMonthTrend: async (userId) => {
    const result = await pool.query(
      `SELECT
        TO_CHAR(DATE_TRUNC('month', end_time), 'Mon') AS month,
        COUNT(*) AS action_count,
        COALESCE(SUM(xp_gained), 0) AS xp_earned
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       AND end_time >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', end_time)
       ORDER BY DATE_TRUNC('month', end_time) ASC`,
      [userId]
    );
    return result.rows;
  },

  // Get monthly goals
  getMonthlyGoals: async (userId) => {
    const result = await pool.query(
      `SELECT * FROM monthly_goal
       WHERE user_id = $1
       AND DATE_TRUNC('month', created_at) =
           DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    return result.rows[0];
  },

  // Get CO2 saved comparison with others
  getCo2Comparison: async (userId, period) => {
    let dateFilter = '';
    if (period === 'this_week') {
      dateFilter = `AND DATE_TRUNC('week', end_time) =
                    DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'this_month') {
      dateFilter = `AND DATE_TRUNC('month', end_time) =
                    DATE_TRUNC('month', CURRENT_DATE)`;
    }

    // User's CO2
    const userCo2 = await pool.query(
      `SELECT COALESCE(SUM(co2_saved), 0) AS co2
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       ${dateFilter}`,
      [userId]
    );

    // Average CO2 of all users
    const avgCo2 = await pool.query(
      `SELECT COALESCE(AVG(user_co2.co2), 0) AS avg_co2
       FROM (
         SELECT user_id, SUM(co2_saved) AS co2
         FROM user_action
         WHERE status = 'completed'
         ${dateFilter}
         GROUP BY user_id
       ) AS user_co2`
    );

    const userVal = parseFloat(userCo2.rows[0].co2);
    const avgVal = parseFloat(avgCo2.rows[0].avg_co2);
    const percentDiff = avgVal > 0
      ? Math.round(((userVal - avgVal) / avgVal) * 100)
      : 0;

    return {
      user_co2: userVal,
      average_co2: avgVal,
      percent_diff: percentDiff
    };
  },

  // Get Litre saved comparison with others
  getLitreComparison: async (userId, period) => {
    let dateFilter = '';
    if (period === 'this_week') {
      dateFilter = `AND DATE_TRUNC('week', end_time) =
                    DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'this_month') {
      dateFilter = `AND DATE_TRUNC('month', end_time) =
                    DATE_TRUNC('month', CURRENT_DATE)`;
    }

    // User's litre saved
    const userLitre = await pool.query(
      `SELECT COALESCE(SUM(litre_saved), 0) AS litre
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       ${dateFilter}`,
      [userId]
    );

    // Average litre saved of all users
    const avgLitre = await pool.query(
      `SELECT COALESCE(AVG(user_litre.litre), 0) AS avg_litre
       FROM (
         SELECT user_id, SUM(litre_saved) AS litre
         FROM user_action
         WHERE status = 'completed'
         ${dateFilter}
         GROUP BY user_id
       ) AS user_litre`
    );

    const userVal = parseFloat(userLitre.rows[0].litre);
    const avgVal = parseFloat(avgLitre.rows[0].avg_litre);
    const percentDiff = avgVal > 0
      ? Math.round(((userVal - avgVal) / avgVal) * 100)
      : 0;

    return {
      user_litre: userVal,
      average_litre: avgVal,
      percent_diff: percentDiff
    };
  },

  // Get kWh saved comparison with others
  getKwhComparison: async (userId, period) => {
    let dateFilter = '';
    if (period === 'this_week') {
      dateFilter = `AND DATE_TRUNC('week', end_time) =
                    DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'this_month') {
      dateFilter = `AND DATE_TRUNC('month', end_time) =
                    DATE_TRUNC('month', CURRENT_DATE)`;
    }

    // User's kwh saved
    const userKwh = await pool.query(
      `SELECT COALESCE(SUM(kwh_saved), 0) AS kwh
       FROM user_action
       WHERE user_id = $1
       AND status = 'completed'
       ${dateFilter}`,
      [userId]
    );

    // Average kwh saved of all users
    const avgKwh = await pool.query(
      `SELECT COALESCE(AVG(user_kwh.kwh), 0) AS avg_kwh
       FROM (
         SELECT user_id, SUM(kwh_saved) AS kwh
         FROM user_action
         WHERE status = 'completed'
         ${dateFilter}
         GROUP BY user_id
       ) AS user_kwh`
    );

    const userVal = parseFloat(userKwh.rows[0].kwh);
    const avgVal = parseFloat(avgKwh.rows[0].avg_kwh);
    const percentDiff = avgVal > 0
      ? Math.round(((userVal - avgVal) / avgVal) * 100)
      : 0;

    return {
      user_kwh: userVal,
      average_kwh: avgVal,
      percent_diff: percentDiff
    };
  },

};

module.exports = progressModel;