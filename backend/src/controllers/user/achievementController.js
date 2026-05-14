// backend/src/controllers/user/achievementController.js  (FULL REPLACEMENT)
const userAchievementModel  = require('../../models/userAchievementModel');
const userStreakRewardModel  = require('../../models/userStreakRewardModel');
const achievementModel      = require('../../models/achievementModel');
const badgeModel            = require('../../models/badgeModel');
const userModel             = require('../../models/userModel');
const xpService             = require('../../utils/xpService');
const pool                  = require('../../config/db');

// ── Helper: get current progress for any achievement type ──
const getCurrentProgress = async (userId, achievement) => {
  try {
    switch (achievement.type) {

      case 'log': {
        if (!achievement.action_category_id) return 0;
        return await userAchievementModel
          .getLogProgress(userId, achievement.action_category_id);
      }

      case 'log_specific_action': {
        if (!achievement.action_id) return 0;
        const r = await pool.query(
          `SELECT COUNT(*) AS count
           FROM user_action
           WHERE user_id = $1
             AND action_id = $2
             AND status = 'completed'`,
          [userId, achievement.action_id]
        );
        return parseInt(r.rows[0].count);
      }

      case 'reach_level': {
        const user = await userModel.getProfile(userId);
        return user.level;
      }

      case 'maintain_streak': {
        const user = await userModel.getProfile(userId);
        return user.streak;
      }

      case 'earn_total_xp': {
        const user = await userModel.getProfile(userId);
        return user.total_xp;
      }

      case 'save_co2': {
        const r = await pool.query(
          `SELECT COALESCE(SUM(co2_saved), 0) AS total
           FROM user_action WHERE user_id = $1 AND status = 'completed'`,
          [userId]
        );
        return parseFloat(r.rows[0].total);
      }

      case 'save_litre': {
        const r = await pool.query(
          `SELECT COALESCE(SUM(litre_saved), 0) AS total
           FROM user_action WHERE user_id = $1 AND status = 'completed'`,
          [userId]
        );
        return parseFloat(r.rows[0].total);
      }

      case 'save_kwh': {
        const r = await pool.query(
          `SELECT COALESCE(SUM(kwh_saved), 0) AS total
           FROM user_action WHERE user_id = $1 AND status = 'completed'`,
          [userId]
        );
        return parseFloat(r.rows[0].total);
      }

      case 'add_friends': {
        const r = await pool.query(
          `SELECT COUNT(*) FROM friendship
           WHERE (request_sender_user_id = $1
              OR request_receiver_user_id = $1)
             AND status = 'approved'`,
          [userId]
        );
        return parseInt(r.rows[0].count);
      }

      case 'complete_challenges': {
        const r = await pool.query(
          `SELECT COUNT(DISTINCT cr.challenge_id) AS total
           FROM user_challenge_reward ucr
           JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
           JOIN challenge c ON cr.challenge_id = c.id
           WHERE ucr.user_id = $1
             AND cr.type = 'completion'
             AND c.type = 'solo'`,
          [userId]
        );
        return parseInt(r.rows[0].total);
      }

      case 'complete_team_challenges': {
        const r = await pool.query(
          `SELECT COUNT(DISTINCT cr.challenge_id) AS total
           FROM user_challenge_reward ucr
           JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
           JOIN challenge c ON cr.challenge_id = c.id
           WHERE ucr.user_id = $1
             AND cr.type = 'completion'
             AND c.type = 'team'`,
          [userId]
        );
        return parseInt(r.rows[0].total);
      }

      default:
        return 0;
    }
  } catch (err) {
    console.error(`Progress calc error for type ${achievement.type}:`, err);
    return 0;
  }
};

const achievementController = {

  // GET ALL BADGES (unlocked + locked)
  getBadges: async (req, res) => {
    const userId = req.user.id;
    try {
      const achievements = await userAchievementModel.getAllWithProgress(userId);
      const unlocked = achievements.filter(a => a.is_unlocked);
      const locked   = achievements.filter(a => !a.is_unlocked);

      const lockedWithProgress = await Promise.all(
        locked.map(async (a) => ({
          ...a,
          current_progress: await getCurrentProgress(userId, a),
          target_value:     a.target_value,
        }))
      );

      res.json({
        message: 'Badges retrieved successfully.',
        data: {
          total_unlocked: unlocked.length,
          total_locked:   locked.length,
          unlocked,
          locked: lockedWithProgress,
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
      const achievements = await userAchievementModel.getAllWithProgress(userId);

      const achievementsWithProgress = await Promise.all(
        achievements.map(async (a) => ({
          ...a,
          current_progress: await getCurrentProgress(userId, a),
        }))
      );

      res.json({
        message: 'Achievements retrieved successfully.',
        data: achievementsWithProgress,
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
      const rewards = await userStreakRewardModel.getAllWithStatus(userId);
      const user    = await userModel.getProfile(userId);

      res.json({
        message: 'Streak rewards retrieved successfully.',
        data: {
          current_streak: user.streak,
          rewards,
        }
      });

    } catch (err) {
      console.error('Get streak rewards error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CLAIM STREAK REWARD — XP added here (not on streak hit)
  claimStreakReward: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const reward = await userStreakRewardModel.getById(id);

      if (!reward) {
        return res.status(404).json({ message: 'Streak reward not found.' });
      }
      if (reward.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (reward.status === 'claimed') {
        return res.status(400).json({ message: 'Reward already claimed.' });
      }

      let xpResult = null;
      if (reward.xp_reward > 0) {
        xpResult = await xpService.addXP(userId, reward.xp_reward);
      }

      await userStreakRewardModel.claim(id);

      const user = await userModel.getProfile(userId);

      res.json({
        message: 'Streak reward claimed!',
        data: {
          day:        reward.day,
          xp_reward:  reward.xp_reward,
          badge_name: reward.badge_name,
          badge_image: reward.badge_image,
          level_up:   xpResult?.level_up  || false,
          new_level:  xpResult?.new_level || null,
          user: {
            level:     user.level,
            level_xp:  user.level_xp,
            total_xp:  user.total_xp,
            weekly_xp: user.weekly_xp,
            streak:    user.streak,
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
    const { id } = req.params;
    try {
      const user = await userModel.getPublicProfile(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const achievements = await userAchievementModel.getAllWithProgress(id);
      const unlocked     = achievements.filter(a => a.is_unlocked);
      const locked       = achievements.filter(a => !a.is_unlocked);

      res.json({
        message: 'Friend badges retrieved successfully.',
        data: {
          user: {
            id:            user.id,
            username:      user.username,
            profile_image: user.profile_image,
            level:         user.level,
          },
          total_unlocked: unlocked.length,
          total_locked:   locked.length,
          unlocked,
          locked,
        }
      });

    } catch (err) {
      console.error('Get friend badges error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = achievementController;
