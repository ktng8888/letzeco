const userAchievementModel = require('../../models/userAchievementModel');
const userStreakRewardModel = require('../../models/userStreakRewardModel');
const achievementModel = require('../../models/achievementModel');
const badgeModel = require('../../models/badgeModel');
const userModel = require('../../models/userModel');

const achievementController = {

  // GET ALL BADGES (unlocked + locked)
  getBadges: async (req, res) => {
    const userId = req.user.id;
    try {
      const achievements = await userAchievementModel
        .getAllWithProgress(userId);

      // Separate unlocked and locked
      const unlocked = achievements.filter(a => a.is_unlocked);
      const locked = achievements.filter(a => !a.is_unlocked);

      // Add progress to locked achievements
      const lockedWithProgress = await Promise.all(
        locked.map(async (a) => {
          let currentProgress = 0;

          if (a.type === 'log' && a.action_category_id) {
            currentProgress = await userAchievementModel
              .getLogProgress(userId, a.action_category_id);
          } else if (a.type === 'reach_level') {
            const user = await userModel.getProfile(userId);
            currentProgress = user.level;
          }

          return {
            ...a,
            current_progress: currentProgress,
            target_value: a.target_value
          };
        })
      );

      res.json({
        message: 'Badges retrieved successfully.',
        data: {
          total_unlocked: unlocked.length,
          total_locked: locked.length,
          unlocked,
          locked: lockedWithProgress
        }
      });

    } catch (err) {
      console.error('Get badges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET MY ACHIEVEMENTS PROGRESS
  getAchievements: async (req, res) => {
    const userId = req.user.id;
    try {
      const achievements = await userAchievementModel
        .getAllWithProgress(userId);

      // Add progress to each achievement
      const achievementsWithProgress = await Promise.all(
        achievements.map(async (a) => {
          let currentProgress = 0;

          if (a.type === 'log' && a.action_category_id) {
            currentProgress = await userAchievementModel
              .getLogProgress(userId, a.action_category_id);
          } else if (a.type === 'reach_level') {
            const user = await userModel.getProfile(userId);
            currentProgress = user.level;
          }

          return {
            ...a,
            current_progress: currentProgress,
          };
        })
      );

      res.json({
        message: 'Achievements retrieved successfully.',
        data: achievementsWithProgress
      });

    } catch (err) {
      console.error('Get achievements error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET STREAK REWARDS PROGRESS
  getStreakRewards: async (req, res) => {
    const userId = req.user.id;
    try {
      const rewards = await userStreakRewardModel
        .getAllWithStatus(userId);

      // Get user current streak
      const user = await userModel.getProfile(userId);

      res.json({
        message: 'Streak rewards retrieved successfully.',
        data: {
          current_streak: user.streak,
          rewards
        }
      });

    } catch (err) {
      console.error('Get streak rewards error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CLAIM STREAK REWARD
  claimStreakReward: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const reward = await userStreakRewardModel.getById(id);
      if (!reward) {
        return res.status(404).json({
          message: 'Streak reward not found.'
        });
      }

      // Make sure it belongs to this user
      if (reward.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      // Check if already claimed
      if (reward.status === 'claimed') {
        return res.status(400).json({
          message: 'Reward already claimed.'
        });
      }

      // Mark as claimed
      await userStreakRewardModel.claim(id);

      // Get updated user data
      const user = await userModel.getProfile(userId);

      res.json({
        message: 'Streak reward claimed!',
        data: {
          day: reward.day,
          xp_reward: reward.xp_reward,
          // Note: XP was already added when streak was hit
          // These are the current updated values
          badge_name: reward.badge_name,
          badge_image: reward.badge_image,
          user: {
            level: user.level,
            level_xp: user.level_xp,
            total_xp: user.total_xp,
            weekly_xp: user.weekly_xp,
            streak: user.streak
          }
        }
      });

    } catch (err) {
      console.error('Claim streak reward error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET FRIEND BADGES (view friend's badges)
  getFriendBadges: async (req, res) => {
    const { id } = req.params; // friend user id
    try {
      const user = await userModel.getPublicProfile(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const achievements = await userAchievementModel
        .getAllWithProgress(id);

      const unlocked = achievements.filter(a => a.is_unlocked);
      const locked = achievements.filter(a => !a.is_unlocked);

      res.json({
        message: 'Friend badges retrieved successfully.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            profile_image: user.profile_image,
            level: user.level
          },
          total_unlocked: unlocked.length,
          total_locked: locked.length,
          unlocked,
          locked
        }
      });

    } catch (err) {
      console.error('Get friend badges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = achievementController;