// backend/src/utils/streakService.js  (FULL REPLACEMENT)
const userModel            = require('../models/userModel');
const userActionModel      = require('../models/userActionModel');
const streakRewardModel    = require('../models/streakRewardModel');
const userStreakRewardModel = require('../models/userStreakRewardModel');
const xpService            = require('./xpService');   // ← ADD

const streakService = {

  updateStreak: async (userId) => {
    try {
      const user        = await userModel.findById(userId);
      const lastActions = await userActionModel.getLastCompletedDates(userId, 2);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newStreak       = user.streak;
      let streakContinued = false;
      let streakRestarted = false;

      if (lastActions.length <= 1) {
        newStreak       = 1;
        streakContinued = true;
      } else {
        const previousDate = new Date(lastActions[1].last_date);
        previousDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today - previousDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          streakContinued = false;
        } else if (diffDays === 1) {
          newStreak       = user.streak + 1;
          streakContinued = true;
        } else {
          newStreak       = 1;
          streakContinued = true;
          streakRestarted = true;
        }
      }

      if (streakContinued) {
        if (streakRestarted) {
          await userStreakRewardModel.deleteUnclaimedByUserId(userId);
        }
        await userModel.updateStreak(userId, newStreak);
      }

      let streakReward      = null;
      let streakAchievement = null;

      if (streakContinued) {
        streakReward = await streakService.checkStreakReward(userId, newStreak);

        // ── NEW: check streak-based achievement ──
        streakAchievement = await xpService.checkStreakAchievement(
          userId, newStreak
        );
      }

      return {
        streak_continued:  streakContinued,
        new_streak:        newStreak,
        streak_reward:     streakReward,
        streak_achievement: streakAchievement,  // ← returned so controller can use it
      };

    } catch (err) {
      console.error('Update streak error:', err);
      throw err;
    }
  },

  checkStreakReward: async (userId, currentStreak) => {
    try {
      if (currentStreak <= 7) {
        // Normal path: look up static reward
        const reward = await streakRewardModel.getByDay(currentStreak);
        if (!reward) return null;

        const existing = await userStreakRewardModel.getByUserAndDay(userId, currentStreak);
        if (existing) return null;

        await userStreakRewardModel.create(
          userId,
          reward.id,
          reward.day,
          reward.xp_reward
        );
        return {
          day:         reward.day,
          xp_reward:   reward.xp_reward,
          badge_name:  reward.badge_name,
          badge_image: reward.badge_image,
        };
      } else {
        // Day 8+: fixed 200 XP, no static streak_reward row
        // Check if already created for this day
        const existing = await userStreakRewardModel.getByUserAndDay(userId, currentStreak);
        if (existing) return null;

        await userStreakRewardModel.createForDay(userId, currentStreak, 200);
        return {
          day:         currentStreak,
          xp_reward:   200,
          badge_name:  null,
          badge_image: null,
        };
      }
    } catch (err) {
      console.error('Check streak reward error:', err);
      throw err;
    }
  },

  checkAndResetStreak: async (userId) => {
    try {
      const user        = await userModel.findById(userId);
      const lastActions = await userActionModel.getLastCompletedDates(userId, 1);

      if (lastActions.length === 0) {
        if (user.streak > 0) await userModel.updateStreak(userId, 0);
        await userStreakRewardModel.deleteUnclaimedByUserId(userId);
        return;
      }

      const lastDate = new Date(lastActions[0].last_date);
      lastDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today - lastDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 1) {
        if (user.streak > 0) await userModel.updateStreak(userId, 0);
        await userStreakRewardModel.deleteUnclaimedByUserId(userId);
        console.log(`Streak reset for user ${userId}`);
      }

    } catch (err) {
      console.error('Check reset streak error:', err);
      throw err;
    }
  },

  resetBrokenStreaks: async () => {
    try {
      const resetUsers = await userModel.resetBrokenStreaks();
      if (resetUsers.length > 0) {
        console.log(`Reset ${resetUsers.length} broken streak(s).`);
      }
      return resetUsers;
    } catch (err) {
      console.error('Reset broken streaks error:', err);
      throw err;
    }
  },

};

module.exports = streakService;
