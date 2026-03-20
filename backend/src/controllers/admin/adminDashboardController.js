const dashboardModel = require('../../models/dashboardModel');

const adminDashboardController = {

  getDashboard: async (req, res) => {
    try {
      const totalUsers = await dashboardModel.getTotalUsers();
      const totalActionsLogged = await dashboardModel.getTotalActionsLogged();
      const totalActionsAvailable = await dashboardModel.getTotalActionsAvailable();
      const totalChallenges = await dashboardModel.getTotalChallenges();
      const activeChallenges = await dashboardModel.getActiveChallenges();
      const popularActions = await dashboardModel.getPopularActions();

      res.json({
        message: 'Dashboard data retrieved successfully.',
        data: {
          total_users: totalUsers,
          total_actions_logged: totalActionsLogged,
          total_actions_available: totalActionsAvailable,
          total_challenges: totalChallenges,
          active_challenges: activeChallenges,
          popular_actions: popularActions,
        }
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = adminDashboardController;