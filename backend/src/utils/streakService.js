const pool = require('../config/db');
const userModel = require('../models/userModel');

const streakService = {

  updateStreak: async (userId) => {
    try {
      const user = await userModel.findById(userId);

      const lastActionResult = await pool.query(
        `SELECT DATE(end_time) AS last_date
         FROM user_action
         WHERE user_id = $1
         AND status = 'completed'
         ORDER BY end_time DESC
         LIMIT 2`,
        [userId]
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newStreak = user.streak;
      let streakContinued = false;

      if (lastActionResult.rows.length === 0) {
        newStreak = 1;
        streakContinued = true;
      } else if (lastActionResult.rows.length === 1) {
        // First ever completed action
        newStreak = 1;
        streakContinued = true;
      } else {
        const previousDate = new Date(lastActionResult.rows[1].last_date);
        previousDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today - previousDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          streakContinued = false;
        } else if (diffDays === 1) {
          newStreak = user.streak + 1;
          streakContinued = true;
        } else {
          newStreak = 1;
          streakContinued = true;
        }
      }

      // Update streak in DB only if changed
      if (streakContinued) {
        await userModel.updateStreak(userId, newStreak);
      }

      // Check for streak reward
      let streakReward = null;
      if (streakContinued) {
        streakReward = await streakService.checkStreakReward(
          userId, newStreak
        );
      }

      return {
        streak_continued: streakContinued,
        new_streak: newStreak,
        streak_reward: streakReward
      };

    } catch (err) {
      console.error('Update streak error:', err);
      throw err;
    }
  },

  checkStreakReward: async (userId, currentStreak) => {
    try {
      const rewardResult = await pool.query(
        `SELECT sr.*, b.name AS badge_name, b.image AS badge_image
         FROM streak_reward sr
         LEFT JOIN badge b ON sr.bagde_id = b.id
         WHERE sr.day = $1`,
        [currentStreak]
      );

      if (rewardResult.rows.length === 0) return null;

      const reward = rewardResult.rows[0];

      // Check if user already has this reward
      const existing = await pool.query(
        `SELECT * FROM user_streak_reward
         WHERE user_id = $1 AND streak_reward_id = $2`,
        [userId, reward.id]
      );

      if (existing.rows.length > 0) return null;

      // Give reward to user — save as unclaimed
      await pool.query(
        `INSERT INTO user_streak_reward
          (user_id, streak_reward_id, obtain_date, status)
         VALUES ($1, $2, NOW(), 'unclaimed')`,
        [userId, reward.id]
      );

      // Add XP to user immediately
      if (reward.xp_reward > 0) {
        await userModel.addXpDirect(userId, reward.xp_reward);
      }

      return {
        day: reward.day,
        xp_reward: reward.xp_reward,
        badge_name: reward.badge_name,
        badge_image: reward.badge_image
      };

    } catch (err) {
      console.error('Check streak reward error:', err);
      throw err;
    }
  },

  checkAndResetStreak: async (userId) => {
    try {
      const user = await userModel.findById(userId);

      const lastActionResult = await pool.query(
        `SELECT DATE(end_time) AS last_date
        FROM user_action
        WHERE user_id = $1
        AND status = 'completed'
        ORDER BY end_time DESC
        LIMIT 1`,
        [userId]
      );

      if (lastActionResult.rows.length === 0) return;

      const lastDate = new Date(lastActionResult.rows[0].last_date);
      lastDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today - lastDate) / (1000 * 60 * 60 * 24)
      );

      // If more than 1 day gap → reset streak
      if (diffDays > 1 && user.streak > 0) {
        await userModel.updateStreak(userId, 0);
        console.log(`Streak reset for user ${userId}`);
      }

    } catch (err) {
      console.error('Check reset streak error:', err);
      throw err;
    }
  },

};

module.exports = streakService;