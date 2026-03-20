const pool = require('../config/db');

const xpService = {

  // Add XP to user and check for level up
  addXP: async (userId, xpToAdd) => {
    try {
      // Get current user data
      const userResult = await pool.query(
        'SELECT * FROM "user" WHERE id = $1', [userId]
      );
      const user = userResult.rows[0];

      // Get level info
      const levelResult = await pool.query(
        'SELECT * FROM level WHERE level_value = $1',
        [user.level]
      );
      const currentLevelInfo = levelResult.rows[0];

      // Calculate new XP values
      const newLevelXp = user.level_xp + xpToAdd;
      const newTotalXp = user.total_xp + xpToAdd;
      const newWeeklyXp = user.weekly_xp + xpToAdd;

      let newLevel = user.level;
      let remainingXp = newLevelXp;
      let leveledUp = false;

      // Check if user leveled up
      if (currentLevelInfo && newLevelXp >= currentLevelInfo.xp_to_next_level) {
        newLevel = user.level + 1;
        remainingXp = newLevelXp - currentLevelInfo.xp_to_next_level;
        leveledUp = true;
      }

      // Update user XP and level
      await pool.query(
        `UPDATE "user" SET
          level_xp = $1,
          total_xp = $2,
          weekly_xp = $3,
          level = $4
         WHERE id = $5`,
        [remainingXp, newTotalXp, newWeeklyXp, newLevel, userId]
      );

      // Check achievements if leveled up
      let newAchievement = null;
      if (leveledUp) {
        newAchievement = await xpService.checkLevelAchievement(
          userId, newLevel
        );
      }

      return {
        xp_added: xpToAdd,
        level_up: leveledUp,
        new_level: newLevel,
        new_level_xp: remainingXp,
        new_total_xp: newTotalXp,
        new_weekly_xp: newWeeklyXp,
        new_achievement: newAchievement
      };

    } catch (err) {
      console.error('Add XP error:', err);
      throw err;
    }
  },

  // Check if user unlocked a level-based achievement
  checkLevelAchievement: async (userId, newLevel) => {
    try {
      // Find achievement for this level
      const achievementResult = await pool.query(
        `SELECT a.*, b.name AS badge_name, b.image AS badge_image
         FROM achievement a
         LEFT JOIN badge b ON a.bagde_id = b.id
         WHERE a.type = 'reach_level'
         AND a.target_value = $1`,
        [newLevel]
      );

      if (achievementResult.rows.length === 0) return null;

      const achievement = achievementResult.rows[0];

      // Check if user already has this achievement
      const existing = await pool.query(
        `SELECT * FROM user_achievement
         WHERE user_id = $1 AND achievement_id = $2`,
        [userId, achievement.id]
      );

      if (existing.rows.length > 0) return null;

      // Give achievement to user
      await pool.query(
        `INSERT INTO user_achievement (user_id, achievement_id, achieve_date)
         VALUES ($1, $2, NOW())`,
        [userId, achievement.id]
      );

      // Give bonus XP for achievement
      if (achievement.bonus_xp > 0) {
        await pool.query(
          `UPDATE "user" SET
            total_xp = total_xp + $1,
            level_xp = level_xp + $1,
            weekly_xp = weekly_xp + $1
           WHERE id = $2`,
          [achievement.bonus_xp, userId]
        );
      }

      return {
        id: achievement.id,
        name: achievement.name,
        bonus_xp: achievement.bonus_xp,
        badge_name: achievement.badge_name,
        badge_image: achievement.badge_image
      };

    } catch (err) {
      console.error('Check level achievement error:', err);
      throw err;
    }
  },

  // Check if user unlocked a log-based achievement
  checkLogAchievement: async (userId, actionCategoryId) => {
    try {
      // Count total logs for this category
      const logCount = await pool.query(
        `SELECT COUNT(*) FROM user_action ua
         LEFT JOIN action a ON ua.action_id = a.id
         WHERE ua.user_id = $1
         AND a.action_category_id = $2
         AND ua.status = 'completed'`,
        [userId, actionCategoryId]
      );

      const count = parseInt(logCount.rows[0].count);

      // Find matching achievement
      const achievementResult = await pool.query(
        `SELECT a.*, b.name AS badge_name, b.image AS badge_image
         FROM achievement a
         LEFT JOIN badge b ON a.bagde_id = b.id
         WHERE a.type = 'log'
         AND a.action_category_id = $1
         AND a.target_value = $2`,
        [actionCategoryId, count]
      );

      if (achievementResult.rows.length === 0) return null;

      const achievement = achievementResult.rows[0];

      // Check if user already has this achievement
      const existing = await pool.query(
        `SELECT * FROM user_achievement
         WHERE user_id = $1 AND achievement_id = $2`,
        [userId, achievement.id]
      );

      if (existing.rows.length > 0) return null;

      // Give achievement to user
      await pool.query(
        `INSERT INTO user_achievement (user_id, achievement_id, achieve_date)
         VALUES ($1, $2, NOW())`,
        [userId, achievement.id]
      );

      // Give bonus XP
      if (achievement.bonus_xp > 0) {
        await pool.query(
          `UPDATE "user" SET
            total_xp = total_xp + $1,
            level_xp = level_xp + $1,
            weekly_xp = weekly_xp + $1
           WHERE id = $2`,
          [achievement.bonus_xp, userId]
        );
      }

      return {
        id: achievement.id,
        name: achievement.name,
        bonus_xp: achievement.bonus_xp,
        badge_name: achievement.badge_name,
        badge_image: achievement.badge_image
      };

    } catch (err) {
      console.error('Check log achievement error:', err);
      throw err;
    }
  },

};

module.exports = xpService;