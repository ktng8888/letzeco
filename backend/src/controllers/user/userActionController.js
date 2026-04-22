const userActionModel = require('../../models/userActionModel');
const actionModel = require('../../models/actionModel');
const xpService = require('../../utils/xpService');
const streakService = require('../../utils/streakService');
const notificationService = require('../../utils/notificationService');

const userActionController = {

  // START LOGGING AN ACTION
  start: async (req, res) => {
    const userId = req.user.id;
    const { actionId } = req.params;

    try {
      // Check action exists
      const action = await actionModel.getById(actionId);
      if (!action) {
        return res.status(404).json({ message: 'Action not found.' });
      }

      // Check if user already has an action in progress
      const inProgress = await userActionModel.getAnyInProgress(userId);
      if (inProgress) {
        return res.status(400).json({
          message: 'You already have an action in progress. Complete or cancel it first.',
          current_action: inProgress
        });
      }

      // Start the action
      const userAction = await userActionModel.create(userId, actionId);

      res.status(201).json({
        message: 'Action started!',
        data: {
          user_action_id: userAction.id,
          action_name: action.name,
          time_limit: action.time_limit,
          xp_reward: action.xp_reward,
          start_time: userAction.start_time
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
    const { id } = req.params; // user_action id

    try {
      // Get the user action
      const userAction = await userActionModel.getById(id);
      if (!userAction) {
        return res.status(404).json({ message: 'Action log not found.' });
      }

      // Make sure it belongs to this user
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      // Make sure it is in progress
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({
          message: 'This action is not in progress.'
        });
      }

      // Get action details for XP and impact values
      const action = await actionModel.getById(userAction.action_id);

      //Check if action is expired
      if (action.time_limit) {
        const startTime = new Date(userAction.start_time);
        const now = new Date();

        let timeLimitMs = 0;

        //In DB, datatype of interval returns an object, not string, so need to check type first before convert to ms
        if (typeof action.time_limit === 'string') {
          const [hours, minutes, seconds] = action.time_limit
            .split(':').map(Number);

          timeLimitMs =
            (hours * 3600 + minutes * 60 + seconds) * 1000;

        } else {
          const interval = action.time_limit;

          const hours = interval.hours || 0;
          const minutes = interval.minutes || 0;
          const seconds = interval.seconds || 0;

          timeLimitMs =
            (hours * 3600 + minutes * 60 + seconds) * 1000;
        }

        const elapsed = now - startTime; //diff will be always shown in ms, so need use ms

        if (elapsed > timeLimitMs) {
          // Auto cancel — time exceeded
          await userActionModel.cancel(id);
          return res.status(400).json({
            message: 'Time is over! Action has been cancelled.',
            time_exceeded: true
          });
        }
      }

      // Complete the action in DB
      const completed = await userActionModel.complete(
        id,
        action.xp_reward,
        action.co2_saved,
        action.litre_saved,
        action.kwh_saved
      );

      // Add XP to user → check level up → check achievement
      const xpResult = await xpService.addXP(userId, action.xp_reward);

      // Update streak → check streak reward
      const streakResult = await streakService.updateStreak(userId);

      // Check log-based achievement
      const logAchievement = await xpService.checkLogAchievement(
        userId,
        action.action_category_id
      );

      // Needed when out-app push notifications, currently no
      //const userWithToken = await userModel.findById(userId);

      // Send notifications
      if (xpResult.level_up) {
        await notificationService.levelUp(userId, xpResult.new_level);
      }
      if (logAchievement) {
        await notificationService.badgeUnlocked(
          userId, logAchievement.badge_name
        );
      }
      if (streakResult.streak_reward) {
        await notificationService.streakReward(
          userId,
          streakResult.streak_reward.day,
          streakResult.streak_reward.xp_reward
        );
      }

      // Get updated totals
      const [updatedUser, todayImpact] = await Promise.all([
        userActionModel.getTotalCompleted(userId),
        userActionModel.getTodayImpactSummary(userId),
      ]);

      res.json({
        message: 'Action completed!',
        data: {
          user_action: {
            id: completed.id,
            action_name: action.name,
            xp_gained: completed.xp_gained,
            co2_saved: completed.co2_saved,
            litre_saved: completed.litre_saved,
            kwh_saved: completed.kwh_saved,
            start_time: completed.start_time,
            end_time: completed.end_time
          },
          xp: {
            xp_added: xpResult.xp_added,
            new_level_xp: xpResult.new_level_xp,
            new_total_xp: xpResult.new_total_xp,
            new_weekly_xp: xpResult.new_weekly_xp,
          },
          // ↓ frontend checks these for modals
          level_up: xpResult.level_up,
          new_level: xpResult.new_level,
          streak: {
            new_streak: streakResult.new_streak,
            streak_continued: streakResult.streak_continued,
          },
          streak_reward: streakResult.streak_reward,
          badge_unlocked: logAchievement ? true : false,
          new_badge: logAchievement || null,
          total_actions_completed: updatedUser,
          today_impact: {
            total_actions: parseInt(todayImpact.total_actions || 0),
            total_xp_earned: parseInt(todayImpact.total_xp_earned || 0),
            total_co2_saved: parseFloat(todayImpact.total_co2_saved || 0),
            total_litre_saved: parseFloat(todayImpact.total_litre_saved || 0),
            total_kwh_saved: parseFloat(todayImpact.total_kwh_saved || 0),
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

      // Make sure it belongs to this user
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      // Make sure it is in progress
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({
          message: 'This action is not in progress.'
        });
      }

      await userActionModel.cancel(id);

      res.json({ message: 'Action cancelled.' });

    } catch (err) {
      console.error('Cancel action error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET TODAY'S ACTIONS
  getToday: async (req, res) => {
    const userId = req.user.id;
    try {
      const actions = await userActionModel.getTodayActions(userId);

      // Check if any action is currently in progress
      const inProgress = await userActionModel.getAnyInProgress(userId);

      res.json({
        message: "Today's actions retrieved successfully.",
        data: {
          total_today: actions.length,
          is_logging: inProgress ? true : false,
          current_logging: inProgress || null,
          actions
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
      const history = await userActionModel.getHistory(userId);
      const totalCompleted = await userActionModel.getTotalCompleted(userId);

      res.json({
        message: 'Log history retrieved successfully.',
        data: {
          total_actions: totalCompleted,
          history
        }
      });

    } catch (err) {
      console.error('Get history error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SINGLE LOG DETAIL
  getHistoryById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const log = await userActionModel.getById(id);
      if (!log) {
        return res.status(404).json({ message: 'Log not found.' });
      }

      // Make sure it belongs to this user
      if (log.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      // Get how many times user logged this action
      const logCount = await userActionModel.getUserLogCount(
        userId, log.action_id
      );

      // Get total actions completed by user
      const totalCompleted = await userActionModel.getTotalCompleted(userId);

      res.json({
        message: 'Log detail retrieved successfully.',
        data: {
          ...log,
          times_logged_this_action: logCount,
          total_actions_completed: totalCompleted
        }
      });

    } catch (err) {
      console.error('Get history by id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = userActionController;
