const pool = require('../config/db');

const achievementSelect = `
  SELECT a.*, b.name AS badge_name, b.image AS badge_image
  FROM achievement a
  LEFT JOIN badge b ON a.badge_id = b.id
`;

const getUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM "user" WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

const normalizeCurrentUserLevel = async (userId) => {
  const user = await getUser(userId);
  if (!user) return null;

  let level = parseInt(user.level || 1);
  let levelXp = parseInt(user.level_xp || 0);
  let leveledUp = false;

  while (true) {
    const levelResult = await pool.query(
      'SELECT * FROM level WHERE level_value = $1',
      [level]
    );
    const levelInfo = levelResult.rows[0];

    if (!levelInfo || levelXp < levelInfo.xp_to_next_level) break;

    levelXp -= levelInfo.xp_to_next_level;
    level += 1;
    leveledUp = true;
  }

  if (leveledUp || levelXp !== user.level_xp || level !== user.level) {
    await pool.query(
      `UPDATE "user"
       SET level = $1, level_xp = $2
       WHERE id = $3`,
      [level, levelXp, userId]
    );
  }

  return {
    ...user,
    level,
    level_xp: levelXp,
    leveled_up: leveledUp,
  };
};

const unlockAchievement = async (userId, achievement) => {
  const existing = await pool.query(
    `SELECT id FROM user_achievement
     WHERE user_id = $1 AND achievement_id = $2`,
    [userId, achievement.id]
  );
  if (existing.rows.length > 0) return null;

  await pool.query(
    `INSERT INTO user_achievement (user_id, achievement_id, achieve_date)
     VALUES ($1, $2, NOW())`,
    [userId, achievement.id]
  );

  const bonusXp = parseInt(achievement.bonus_xp || 0);
  if (bonusXp > 0) {
    await pool.query(
      `UPDATE "user" SET
        total_xp = total_xp + $1,
        level_xp = level_xp + $1,
        weekly_xp = weekly_xp + $1
       WHERE id = $2`,
      [bonusXp, userId]
    );
    await normalizeCurrentUserLevel(userId);
  }

  return {
    id: achievement.id,
    name: achievement.name,
    bonus_xp: bonusXp,
    badge_name: achievement.badge_name,
    badge_image: achievement.badge_image,
  };
};

const getEligibleAchievements = async (type, progress, categoryId = null) => {
  let query;
  let params;

  if (categoryId !== null && categoryId !== undefined) {
    query = `
      ${achievementSelect}
      WHERE a.type = $1
        AND a.target_value <= $2
        AND a.action_category_id = $3
      ORDER BY a.target_value ASC`;
    params = [type, progress, categoryId];
  } else {
    query = `
      ${achievementSelect}
      WHERE a.type = $1
        AND a.target_value <= $2
        AND (a.action_category_id IS NULL OR a.action_category_id = 0)
      ORDER BY a.target_value ASC`;
    params = [type, progress];
  }

  const result = await pool.query(query, params);
  return result.rows;
};

const unlockEligibleAchievements = async (
  userId,
  type,
  progress,
  categoryId = null
) => {
  const achievements = await getEligibleAchievements(type, progress, categoryId);
  const unlocked = [];

  for (const achievement of achievements) {
    const result = await unlockAchievement(userId, achievement);
    if (result) unlocked.push(result);
  }

  return unlocked;
};

const unlockSpecificActionAchievements = async (userId, actionId, progress) => {
  const result = await pool.query(
    `${achievementSelect}
     WHERE a.type = 'log_specific_action'
       AND a.action_id = $1
       AND a.target_value <= $2
     ORDER BY a.target_value ASC`,
    [actionId, progress]
  );
  const unlocked = [];

  for (const achievement of result.rows) {
    const unlockedAchievement = await unlockAchievement(userId, achievement);
    if (unlockedAchievement) unlocked.push(unlockedAchievement);
  }

  return unlocked;
};

const firstUnlocked = (unlocked) => unlocked[0] || null;

const xpService = {
  addXP: async (userId, xpToAdd) => {
    try {
      const user = await getUser(userId);
      if (!user) throw new Error('User not found.');

      const xpAmount = parseInt(xpToAdd || 0);
      await pool.query(
        `UPDATE "user" SET
          level_xp = level_xp + $1,
          total_xp = total_xp + $1,
          weekly_xp = weekly_xp + $1
         WHERE id = $2`,
        [xpAmount, userId]
      );

      const allAchievements = [];

      for (let i = 0; i < 20; i++) {
        const currentUser = await normalizeCurrentUserLevel(userId);
        const newlyUnlocked = [
          ...await unlockEligibleAchievements(
            userId,
            'reach_level',
            currentUser.level
          ),
          ...await unlockEligibleAchievements(
            userId,
            'earn_total_xp',
            currentUser.total_xp
          ),
        ];

        if (newlyUnlocked.length === 0) break;
        allAchievements.push(...newlyUnlocked);
      }

      const finalUser = await normalizeCurrentUserLevel(userId);

      return {
        xp_added: xpAmount,
        level_up: finalUser.level > user.level,
        new_level: finalUser.level,
        new_level_xp: finalUser.level_xp,
        new_total_xp: finalUser.total_xp,
        new_weekly_xp: finalUser.weekly_xp,
        new_achievement: firstUnlocked(allAchievements),
        new_achievements: allAchievements,
      };
    } catch (err) {
      console.error('Add XP error:', err);
      throw err;
    }
  },

  checkLevelAchievement: async (userId, newLevel) => {
    try {
      return firstUnlocked(
        await unlockEligibleAchievements(userId, 'reach_level', newLevel)
      );
    } catch (err) {
      console.error('Check level achievement error:', err);
      throw err;
    }
  },

  checkLogAchievement: async (userId, actionCategoryId) => {
    try {
      const logCount = await pool.query(
        `SELECT COUNT(*) FROM user_action ua
         LEFT JOIN action a ON ua.action_id = a.id
         WHERE ua.user_id = $1
           AND a.action_category_id = $2
           AND ua.status = 'completed'`,
        [userId, actionCategoryId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'log',
          parseInt(logCount.rows[0].count),
          actionCategoryId
        )
      );
    } catch (err) {
      console.error('Check log achievement error:', err);
      throw err;
    }
  },

  checkSpecificActionAchievement: async (userId, actionId) => {
    try {
      const logCount = await pool.query(
        `SELECT COUNT(*) FROM user_action
         WHERE user_id = $1
           AND action_id = $2
           AND status = 'completed'`,
        [userId, actionId]
      );

      return firstUnlocked(
        await unlockSpecificActionAchievements(
          userId,
          actionId,
          parseInt(logCount.rows[0].count)
        )
      );
    } catch (err) {
      console.error('Check specific action achievement error:', err);
      return null;
    }
  },

  checkStreakAchievement: async (userId, currentStreak) => {
    try {
      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'maintain_streak',
          currentStreak
        )
      );
    } catch (err) {
      console.error('Check streak achievement error:', err);
      return null;
    }
  },

  checkTotalXpAchievement: async (userId, newTotalXp) => {
    try {
      return firstUnlocked(
        await unlockEligibleAchievements(userId, 'earn_total_xp', newTotalXp)
      );
    } catch (err) {
      console.error('Check total XP achievement error:', err);
      return null;
    }
  },

  checkCo2Achievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(co2_saved), 0) AS total
         FROM user_action
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'save_co2',
          parseFloat(result.rows[0].total)
        )
      );
    } catch (err) {
      console.error('Check CO2 achievement error:', err);
      return null;
    }
  },

  checkLitreAchievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(litre_saved), 0) AS total
         FROM user_action
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'save_litre',
          parseFloat(result.rows[0].total)
        )
      );
    } catch (err) {
      console.error('Check litre achievement error:', err);
      return null;
    }
  },

  checkKwhAchievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(kwh_saved), 0) AS total
         FROM user_action
         WHERE user_id = $1 AND status = 'completed'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'save_kwh',
          parseFloat(result.rows[0].total)
        )
      );
    } catch (err) {
      console.error('Check kWh achievement error:', err);
      return null;
    }
  },

  checkFriendAchievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM friendship
         WHERE (request_sender_user_id = $1
            OR request_receiver_user_id = $1)
           AND status = 'approved'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'add_friends',
          parseInt(result.rows[0].count)
        )
      );
    } catch (err) {
      console.error('Check friend achievement error:', err);
      return null;
    }
  },

  checkChallengeAchievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(DISTINCT cr.challenge_id) AS total
         FROM user_challenge_reward ucr
         JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
         JOIN challenge c ON cr.challenge_id = c.id
         WHERE ucr.user_id = $1
           AND cr.type = 'completion'
           AND c.type = 'solo'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'complete_challenges',
          parseInt(result.rows[0].total)
        )
      );
    } catch (err) {
      console.error('Check challenge achievement error:', err);
      return null;
    }
  },

  checkTeamChallengeAchievement: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(DISTINCT cr.challenge_id) AS total
         FROM user_challenge_reward ucr
         JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
         JOIN challenge c ON cr.challenge_id = c.id
         WHERE ucr.user_id = $1
           AND cr.type = 'completion'
           AND c.type = 'team'`,
        [userId]
      );

      return firstUnlocked(
        await unlockEligibleAchievements(
          userId,
          'complete_team_challenges',
          parseInt(result.rows[0].total)
        )
      );
    } catch (err) {
      console.error('Check team challenge achievement error:', err);
      return null;
    }
  },
};

module.exports = xpService;
