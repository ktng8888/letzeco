const dashboardModel = require('../../models/dashboardModel');

const BADGE_LIMITS = new Set(['5', '10', 'all']);
const ACTION_PERIODS = new Set(['today', 'this_week', 'this_month', 'all_time']);

const adminDashboardController = {
  getDashboard: async (req, res) => {
    try {
      const badgeLimitParam = BADGE_LIMITS.has(req.query.badge_limit)
        ? req.query.badge_limit
        : '5';
      const actionPeriod = ACTION_PERIODS.has(req.query.action_period)
        ? req.query.action_period
        : 'all_time';
      const badgeLimit = badgeLimitParam === 'all'
        ? null
        : Number(badgeLimitParam);

      const [
        totalUsers, totalAdmins, totalCategories,
        totalActionsAvailable, totalActionsLogged,
        activeChallenges, totalChallenges,
        environmentalImpact, topActions, topBadges
      ] = await Promise.all([
        dashboardModel.getTotalUsers(),
        dashboardModel.getTotalAdmins(),
        dashboardModel.getTotalCategories(),
        dashboardModel.getTotalActionsAvailable(),
        dashboardModel.getTotalActionsLogged(),
        dashboardModel.getActiveChallenges(),
        dashboardModel.getTotalChallenges(),
        dashboardModel.getTotalEnvironmentalImpact(),
        dashboardModel.getTopActions(10, actionPeriod),
        dashboardModel.getTopBadgesUnlocked(badgeLimit),
      ]);

      res.json({
        message: 'Dashboard data retrieved successfully.',
        data: {
          total_users: totalUsers,
          total_admins: totalAdmins,
          total_categories: totalCategories,
          total_actions_available: totalActionsAvailable,
          total_actions_logged: totalActionsLogged,
          active_challenges: activeChallenges,
          total_challenges: totalChallenges,
          environmental_impact: environmentalImpact,
          top_actions: topActions,
          top_badges: topBadges,
          filters: {
            badge_limit: badgeLimitParam,
            action_period: actionPeriod,
          },
        }
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },
};

module.exports = adminDashboardController;
