// backend/src/controllers/user/userActionController.js  (FULL REPLACEMENT)
const userActionModel          = require('../../models/userActionModel');
const actionModel              = require('../../models/actionModel');
const proofModel               = require('../../models/proofModel');
const userProofModel           = require('../../models/userProofModel');
const userChallengeModel       = require('../../models/userChallengeModel');
const challengeRewardModel     = require('../../models/challengeRewardModel');
const userChallengeRewardModel = require('../../models/userChallengeRewardModel');
const xpService                = require('../../utils/xpService');
const streakService            = require('../../utils/streakService');
const notificationService      = require('../../utils/notificationService');
const { deleteFile }           = require('../../utils/uploadService');
const jwt                      = require('jsonwebtoken');

const isProofUploadPath = (imagePath) => {
  if (!imagePath) return false;
  const normalized = imagePath.replace(/\\/g, '/');
  return normalized.startsWith('uploads/proofs/') && !normalized.includes('..');
};

const dedupeAchievements = (achievements = []) => {
  const seen = new Set();
  return achievements.filter((achievement) => {
    if (!achievement) return false;
    const key = achievement.id || `${achievement.badge_name}:${achievement.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const achievementItems = (achievement) => {
  if (!achievement) return [];
  if (Array.isArray(achievement)) return achievement;
  if (Array.isArray(achievement.new_achievements)) {
    return achievement.new_achievements;
  }
  return [achievement];
};

const userActionController = {

  // START LOGGING AN ACTION
  start: async (req, res) => {
    const userId   = req.user.id;
    const { actionId } = req.params;

    try {
      const action = await actionModel.getById(actionId);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      const inProgress = await userActionModel.getAnyInProgress(userId);
      if (inProgress) {
        return res.status(400).json({
          message: 'You already have an action in progress. Complete or cancel it first.',
          current_action: inProgress,
        });
      }

      const userAction = await userActionModel.create(userId, actionId);

      res.status(201).json({
        message: 'Action started!',
        data: {
          user_action_id: userAction.id,
          action_name:    action.name,
          time_limit:     action.time_limit,
          xp_reward:      action.xp_reward,
          start_time:     userAction.start_time,
        }
      });

    } catch (err) {
      console.error('Start action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // COMPLETE AN ACTION
  complete: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { proof_image, proof_validation_token } = req.body || {};

    try {
      const userAction = await userActionModel.getById(id);
      if (!userAction) {
        return res.status(404).json({ message: 'Action log not found.' });
      }
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({ message: 'This action is not in progress.' });
      }

      const action = await actionModel.getById(userAction.action_id);
      const proofRequirement = await proofModel.getByActionId(userAction.action_id);
      let approvedProof = null;

      // Time limit check
      if (action.time_limit) {
        const startTime = new Date(userAction.start_time);
        const now       = new Date();
        let timeLimitMs = 0;

        if (typeof action.time_limit === 'string') {
          const [hours, minutes, seconds] = action.time_limit.split(':').map(Number);
          timeLimitMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
        } else {
          const iv = action.time_limit;
          timeLimitMs = ((iv.hours || 0) * 3600 + (iv.minutes || 0) * 60 + (iv.seconds || 0)) * 1000;
        }

        if (now - startTime > timeLimitMs) {
          if (isProofUploadPath(proof_image)) {
            deleteFile(proof_image);
          }
          await userActionModel.cancel(id);
          return res.status(400).json({
            message: 'Time is over! Action has been cancelled.',
            time_exceeded: true,
          });
        }
      }

      const existingProof = await userProofModel.getByUserActionId(id);
      if (existingProof?.status === 'approved') {
        approvedProof = existingProof;
      } else if (proof_validation_token && proofRequirement) {
        let decoded;
        try {
          decoded = jwt.verify(proof_validation_token, process.env.JWT_SECRET);
        } catch (tokenErr) {
          return res.status(400).json({ message: 'Proof validation expired. Please validate again.' });
        }

        if (
          decoded.type !== 'proof_validation' ||
          decoded.status !== 'approved' ||
          decoded.user_id !== userId ||
          decoded.user_action_id !== Number(id) ||
          decoded.proof_id !== proofRequirement.id ||
          decoded.image !== proof_image
        ) {
          return res.status(400).json({ message: 'Invalid proof validation.' });
        }

        approvedProof = await userProofModel.create(
          userId,
          proofRequirement.id,
          id,
          proof_image
        );
        approvedProof = await userProofModel.updateStatus(approvedProof.id, 'approved');
        approvedProof.bonus_xp = proofRequirement.bonus_xp;
      } else if (isProofUploadPath(proof_image)) {
        deleteFile(proof_image);
      }

      // Proof bonus XP
      const userProof = approvedProof || existingProof;
      const bonusXp   = (userProof && userProof.status === 'approved')
        ? (userProof.bonus_xp || 0)
        : 0;

      const totalXpForRecord = action.xp_reward + bonusXp;

      // Complete action
      const completed = await userActionModel.complete(
        id,
        totalXpForRecord,
        action.co2_saved,
        action.litre_saved,
        action.kwh_saved
      );

      // Add XP (also checks level + total_xp achievements inside)
      const xpResult = await xpService.addXP(userId, totalXpForRecord);

      // Update streak (also checks streak achievement inside)
      const streakResult = await streakService.updateStreak(userId);

      // Check log achievement
      const logAchievement = await xpService.checkLogAchievement(
        userId, action.action_category_id
      );
      const specificActionAchievement = await xpService
        .checkSpecificActionAchievement(userId, action.id);

      // ── NEW: Check impact achievements ──
      const [co2Achievement, litreAchievement, kwhAchievement] =
        await Promise.all([
          action.co2_saved   > 0 ? xpService.checkCo2Achievement(userId)   : null,
          action.litre_saved > 0 ? xpService.checkLitreAchievement(userId) : null,
          action.kwh_saved   > 0 ? xpService.checkKwhAchievement(userId)   : null,
        ]);

      // First non-null achievement wins for popup
      const impactAchievement = co2Achievement || litreAchievement || kwhAchievement;

      // ── UPDATE CHALLENGE PROGRESS & CHECK COMPLETION REWARD ──
      let completionGiftEarned = false;
      let challengeAchievement = null;

      try {
        const activeChallenges = await userChallengeModel
          .getActiveForUserAndAction(userId, action.id);

        for (const uc of activeChallenges) {
          let increment = 0;
          if (uc.target_type === 'count')  increment = 1;
          if (uc.target_type === 'co2_kg') increment = parseFloat(action.co2_saved   || 0);
          if (uc.target_type === 'litre')  increment = parseFloat(action.litre_saved  || 0);
          if (uc.target_type === 'kwh')    increment = parseFloat(action.kwh_saved    || 0);

          const prevProgress = parseFloat(uc.progress_value || 0);
          const newProgress  = prevProgress + increment;
          const targetValue  = parseFloat(uc.target_value);

          await userChallengeModel.updateProgress(userId, uc.challenge_id, newProgress);

          if (newProgress >= targetValue && prevProgress < targetValue) {
            const completionReward = await challengeRewardModel
              .getCompletionReward(uc.challenge_id);

            if (completionReward) {
              const alreadyAwarded = await userChallengeRewardModel
                .checkExists(userId, completionReward.id);

              if (!alreadyAwarded) {
                await userChallengeRewardModel.create(userId, completionReward.id);
                completionGiftEarned = true;
                await notificationService.challengeCompleted(
                  userId, uc.challenge_name || 'Challenge'
                );

                // ── NEW: check challenge completion achievement ──
                if (uc.type === 'solo') {
                  challengeAchievement = await xpService
                    .checkChallengeAchievement(userId);
                } else {
                  challengeAchievement = await xpService
                    .checkTeamChallengeAchievement(userId);
                }
              }
            }
          }
        }
      } catch (challengeErr) {
        console.error('Challenge progress update error:', challengeErr);
      }

      // Notifications
      if (xpResult.level_up) {
        await notificationService.levelUp(userId, xpResult.new_level);
      }

      const newBadges = dedupeAchievements([
        ...achievementItems(logAchievement),
        ...achievementItems(impactAchievement),
        ...achievementItems(specificActionAchievement),
        ...achievementItems(challengeAchievement),
        ...achievementItems(streakResult.streak_achievement),
        ...(xpResult.new_achievements || []),
      ]);
      const anyAchievement = newBadges[0] || null;

      for (const achievement of newBadges) {
        await notificationService.badgeUnlocked(userId, achievement.badge_name);
      }

      if (streakResult.streak_reward) {
        await notificationService.streakReward(
          userId,
          streakResult.streak_reward.day,
          streakResult.streak_reward.xp_reward
        );
      }

      const [updatedUser, todayImpact] = await Promise.all([
        userActionModel.getTotalCompleted(userId),
        userActionModel.getTodayImpactSummary(userId),
      ]);

      res.json({
        message: 'Action completed!',
        data: {
          user_action: {
            id:           completed.id,
            action_name:  action.name,
            xp_gained:    completed.xp_gained,
            base_xp:      action.xp_reward,
            bonus_xp_gained: bonusXp,
            co2_saved:    completed.co2_saved,
            litre_saved:  completed.litre_saved,
            kwh_saved:    completed.kwh_saved,
            start_time:   completed.start_time,
            end_time:     completed.end_time,
          },
          xp: {
            xp_added:      xpResult.xp_added,
            new_level_xp:  xpResult.new_level_xp,
            new_total_xp:  xpResult.new_total_xp,
            new_weekly_xp: xpResult.new_weekly_xp,
          },
          level_up:  xpResult.level_up,
          new_level: xpResult.new_level,
          streak: {
            new_streak:       streakResult.new_streak,
            streak_continued: streakResult.streak_continued,
          },
          streak_reward:          streakResult.streak_reward,
          badge_unlocked:         newBadges.length > 0,
          new_badge:              anyAchievement || null,
          new_badges:             newBadges,
          completion_gift_earned: completionGiftEarned,
          total_actions_completed: updatedUser,
          today_impact: {
            total_actions:     parseInt(todayImpact.total_actions    || 0),
            total_xp_earned:   parseInt(todayImpact.total_xp_earned  || 0),
            total_co2_saved:   parseFloat(todayImpact.total_co2_saved  || 0),
            total_litre_saved: parseFloat(todayImpact.total_litre_saved || 0),
            total_kwh_saved:   parseFloat(todayImpact.total_kwh_saved  || 0),
          }
        }
      });

    } catch (err) {
      console.error('Complete action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CANCEL AN ACTION
  cancel: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const userAction = await userActionModel.getById(id);
      if (!userAction) {
        return res.status(404).json({ message: 'Action log not found.' });
      }
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({ message: 'This action is not in progress.' });
      }

      await userActionModel.cancel(id);
      res.json({ message: 'Action has been cancelled.' });

    } catch (err) {
      console.error('Cancel action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET TODAY'S ACTIONS
  getToday: async (req, res) => {
    const userId = req.user.id;
    try {
      const actions    = await userActionModel.getTodayActions(userId);
      const inProgress = await userActionModel.getAnyInProgress(userId);

      res.json({
        message: "Today's actions retrieved successfully.",
        data: {
          total_today:    actions.length,
          is_logging:     inProgress ? true : false,
          current_logging: inProgress || null,
          actions,
        }
      });

    } catch (err) {
      console.error('Get today actions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET LOG HISTORY
  getHistory: async (req, res) => {
    const userId = req.user.id;
    try {
      const history        = await userActionModel.getHistory(userId);
      const totalCompleted = await userActionModel.getTotalCompleted(userId);

      res.json({
        message: 'Log history retrieved successfully.',
        data: {
          total_actions: totalCompleted,
          history,
        }
      });

    } catch (err) {
      console.error('Get history error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE LOG HISTORY
  getHistoryById: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const record = await userActionModel.getById(id);
      if (!record) {
        return res.status(404).json({ message: 'Record not found.' });
      }
      if (record.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      res.json({
        message: 'Record retrieved successfully.',
        data: record,
      });
    } catch (err) {
      console.error('Get history by id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = userActionController;
