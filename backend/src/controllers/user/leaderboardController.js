const leaderboardModel = require('../../models/leaderboardModel');

const leaderboardController = {

  // GET GLOBAL LEADERBOARD
  getGlobal: async (req, res) => {
    const userId = req.user.id;
    try {
      const leaderboard = await leaderboardModel.getGlobal(100);
      const userRank = await leaderboardModel.getUserGlobalRank(userId);

      // Add rank number to each entry
      const rankedLeaderboard = leaderboard.map((user, index) => ({
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
      const leaderboard = await leaderboardModel.getFriends(userId);
      const userRank = await leaderboardModel.getUserFriendsRank(userId);

      const rankedLeaderboard = leaderboard.map((user, index) => ({
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