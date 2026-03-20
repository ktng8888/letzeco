const notificationModel = require('../models/notificationModel');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const notificationService = {

  // ─────────────────────────────────────────
  // INTERNAL HELPER — send push only
  // ─────────────────────────────────────────
  sendPush: async (pushToken, title, message, data) => {
    try {
      if (!pushToken) return;
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error('Invalid Expo push token:', pushToken);
        return;
      }

      const messages = [{
        to: pushToken,
        sound: 'default',
        title,
        body: message,
        data: data || {},
      }];

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

    } catch (err) {
      console.error('Send push error:', err);
    }
  },

  // ─────────────────────────────────────────
  // PUSH + SAVE TO DB
  // ─────────────────────────────────────────

  // Streak reminder (cron job - daily 12PM)
  streakReminder: async (userId, currentStreak, pushToken) => {
    // Save to DB
    await notificationModel.create(
      userId,
      '⚠️ Don\'t Break Your Streak!',
      `Log an eco-action now to keep your ${currentStreak}-day streak alive!`,
      'streak_reminder',
      currentStreak
    );
    // Push notification
    await notificationService.sendPush(
      pushToken,
      '⚠️ Don\'t Break Your Streak!',
      `Log an eco-action now to keep your ${currentStreak}-day streak alive! 🌿`,
      { type: 'streak_reminder', streak: currentStreak }
    );
  },

  // Action deadline reminder (cron job - when timer ending)
  actionDeadlineReminder: async (userId, actionName, pushToken) => {
    // Save to DB
    await notificationModel.create(
      userId,
      '⏰ Eco-action Ending Soon!',
      `Complete "${actionName}" now before time runs out!`,
      'action_deadline',
      null
    );
    // Push notification
    await notificationService.sendPush(
      pushToken,
      '⏰ Eco-action Ending in 2 min...',
      `Complete "${actionName}" now.`,
      { type: 'action_deadline', action: actionName }
    );
  },

  // Friend request approved
  friendRequestApproved: async (userId, approverUsername, pushToken) => {
    // Save to DB
    await notificationModel.create(
      userId,
      '✅ Friend Request Accepted',
      `${approverUsername} accepted your friend request!`,
      'friend_approved',
      null
    );
    // Push notification
    await notificationService.sendPush(
      pushToken,
      '✅ Friend Request Accepted',
      `${approverUsername} accepted your friend request!`,
      { type: 'friend_approved' }
    );
  },

  // ─────────────────────────────────────────
  // SAVE TO DB ONLY (popup handled by frontend)
  // ─────────────────────────────────────────

  // Level up → frontend shows popup from API response
  levelUp: async (userId, newLevel) => {
    await notificationModel.create(
      userId,
      '🎉 Level Up!',
      `Congratulations! You reached Level ${newLevel}!`,
      'level_up',
      newLevel
    );
    // No push — frontend handles popup from response
  },

  // Badge unlocked → frontend shows popup from API response
  badgeUnlocked: async (userId, badgeName) => {
    await notificationModel.create(
      userId,
      '🏅 Badge Unlocked!',
      `You unlocked the "${badgeName}" badge!`,
      'badge_unlocked',
      null
    );
    // No push — frontend handles popup from response
  },

  // ─────────────────────────────────────────
  // SAVE TO DB ONLY (bell notifications)
  // ─────────────────────────────────────────

  // Friend request received
  friendRequest: async (userId, senderUsername) => {
    await notificationModel.create(
      userId,
      '👫 Friend Request',
      `${senderUsername} sent you a friend request.`,
      'friend_request',
      null
    );
    // No push — just shows in notification list
  },

  // Streak reward earned
  streakReward: async (userId, day, xpReward) => {
    await notificationModel.create(
      userId,
      `🔥 ${day} Day Streak!`,
      `You earned ${xpReward} XP for your ${day}-day streak!`,
      'streak_reward',
      day
    );
    // No push — just shows in notification list
  },

  // Challenge completed
  challengeCompleted: async (userId, challengeName) => {
    await notificationModel.create(
      userId,
      '🏆 Challenge Completed!',
      `You completed the "${challengeName}" challenge!`,
      'challenge_completed',
      null
    );
    // No push — just shows in notification list
  },

};

module.exports = notificationService;