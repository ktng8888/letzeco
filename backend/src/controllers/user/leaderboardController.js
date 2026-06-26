const leaderboardModel = require('../../models/leaderboardModel');
const userBadgeModel = require('../../models/userBadgeModel');
const weeklyXpService = require('../../utils/weeklyXpService');

const leaderboardController = {

  // GET GLOBAL LEADERBOARD
  getGlobal: async (req, res) => {
    const userId = req.user.id;
    try {
      await weeklyXpService.syncWeeklyXp();

      const leaderboard = await leaderboardModel.getGlobal(100);
      const userRank = await leaderboardModel.getUserGlobalRank(userId);

      // Add rank number to each entry
      const withEmblems = await userBadgeModel.attachEmblemsToUsers(leaderboard);
      const rankedLeaderboard = withEmblems.map((user, index) => ({
        rank: index + 1,
        ...user,
        is_me: user.id === userId
      }));

      res.json({
        message: 'Global leaderboard retrieved successfully.',
        data: {
          your_rank: userRank,
          leaderboard: rankedLeaderboard
        }
      });

    } catch (err) {
      console.error('Get global leaderboard error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET FRIENDS LEADERBOARD
  getFriends: async (req, res) => {
    const userId = req.user.id;
    try {
      await weeklyXpService.syncWeeklyXp();

      const leaderboard = await leaderboardModel.getFriends(userId);
      const userRank = await leaderboardModel.getUserFriendsRank(userId);

      const withEmblems = await userBadgeModel.attachEmblemsToUsers(leaderboard);
      const rankedLeaderboard = withEmblems.map((user, index) => ({
        rank: index + 1,
        ...user,
        is_me: user.id === userId
      }));

      res.json({
        message: 'Friends leaderboard retrieved successfully.',
        data: {
          your_rank: userRank,
          leaderboard: rankedLeaderboard
        }
      });

    } catch (err) {
      console.error('Get friends leaderboard error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = leaderboardController;
