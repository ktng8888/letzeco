const dashboardModel = require('../../models/dashboardModel');

const adminDashboardController = {
  getDashboard: async (req, res) => {
    try {
      const [
        totalUsers, totalAdmins, totalCategories,
        totalActionsAvailable, totalActionsLogged,
        activeChallenges, totalChallenges,
        environmentalImpact, topActions
      ] = await Promise.all([
        dashboardModel.getTotalUsers(),
        dashboardModel.getTotalAdmins(),
        dashboardModel.getTotalCategories(),
        dashboardModel.getTotalActionsAvailable(),
        dashboardModel.getTotalActionsLogged(),
        dashboardModel.getActiveChallenges(),
        dashboardModel.getTotalChallenges(),
        dashboardModel.getTotalEnvironmentalImpact(),
        dashboardModel.getTopActions(10),
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
        }
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },
};

module.exports = adminDashboardController;