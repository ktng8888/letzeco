const streakService = require('../../utils/streakService');

const streakController = {
  checkResetStreak: async (req, res) => {
    try {
        const userId = req.user.id;
        await streakService.checkAndResetStreak(userId);
        res.json({ message: 'Streak checked and reset if necessary' });

    } catch (err) {
        res.status(500).json({ message: 'Streak check failed' });
    }
    },
};

module.exports = streakController;