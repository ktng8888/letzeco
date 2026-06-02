const pool = require('../config/db');

const userModel = {

  // Find user by email
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE email = $1', [email]
    );
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE username = $1', [username]
    );
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  // Get profile (safe - no password)
  getProfile: async (id) => {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.level, u.level_xp,
              u.total_xp, u.weekly_xp, u.streak, u.best_streak,
              u.profile_image, u.created_at,
              l.xp_to_next_level
      FROM "user" u
      LEFT JOIN level l ON l.level_value = u.level
      WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get public profile (for viewing other users)
  getPublicProfile: async (id) => {
    const result = await pool.query(
      `SELECT u.id, u.username, u.level, u.level_xp,
              u.total_xp, u.weekly_xp, u.streak, u.best_streak,
              u.profile_image, u.created_at,
              l.xp_to_next_level
       FROM "user" u
       LEFT JOIN level l ON l.level_value = u.level
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get total completed actions count
  getTotalActions: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_action
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get total badges count
  getTotalBadges: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_badge
       WHERE user_id = $1
         AND status IN ('unlocked', 'claimed')`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get total friends count
  getTotalFriends: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM friendship
       WHERE (request_sender_user_id = $1
       OR request_receiver_user_id = $1)
       AND status = 'approved'`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get friendship status between two users
  getFriendshipStatus: async (myId, otherId) => {
    const result = await pool.query(
      `SELECT * FROM friendship
       WHERE (request_sender_user_id = $1
         AND request_receiver_user_id = $2)
       OR (request_sender_user_id = $2
         AND request_receiver_user_id = $1)`,
      [myId, otherId]
    );
    return result.rows[0];
  },

  // Get users with action in progress timing out in 2 minutes
  getUsersWithTimingOutActions: async () => {
    const result = await pool.query(
      `SELECT
        ua.id AS user_action_id,
        ua.user_id,
        ua.start_time,
        a.name AS action_name,
        a.time_limit,
        u.push_token,
        u.username,
        (ua.start_time + a.time_limit) AS end_time
       FROM user_action ua
       LEFT JOIN action a ON ua.action_id = a.id
       LEFT JOIN "user" u ON ua.user_id = u.id
       LEFT JOIN notification n
         ON n.related_id = ua.id
        AND n.type = 'action_time_out'
       WHERE ua.status = 'in_progress'
       AND a.time_limit IS NOT NULL
       AND a.time_limit > INTERVAL '2 minutes'
       AND u.push_token IS NOT NULL
       AND n.id IS NULL
       AND (ua.start_time + a.time_limit - INTERVAL '2 minutes')
           BETWEEN NOW() - INTERVAL '30 seconds'
               AND NOW() + INTERVAL '30 seconds'`
    );
    return result.rows;
  },

  // Get users who still need to log an action today to preserve their streak
  getUsersForStreakReminder: async () => {
    const result = await pool.query(
      `SELECT u.id, u.streak, u.push_token
       FROM "user" u
       WHERE u.streak > 0
       AND u.push_token IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
         FROM user_action ua
         WHERE ua.user_id = u.id
         AND ua.status = 'completed'
         AND DATE(ua.end_time) = CURRENT_DATE
       )`
    );
    return result.rows;
  },

  // Get all users (admin)
  getAll: async () => {
    const result = await pool.query(
      `SELECT id, username, email, level, level_xp,
              total_xp, weekly_xp, streak, best_streak, profile_image
       FROM "user" ORDER BY id ASC`
    );
    return result.rows;
  },

  // Update username
  updateUsername: async (userId, username) => {
    const result = await pool.query(
      `UPDATE "user" SET username = $1
       WHERE id = $2
       RETURNING id, username, email, level,
                 level_xp, total_xp, profile_image`,
      [username, userId]
    );
    return result.rows[0];
  },

  // Update email
  updateEmail: async (userId, email) => {
    const result = await pool.query(
      `UPDATE "user" SET email = $1
       WHERE id = $2
       RETURNING id, username, email, profile_image`,
      [email, userId]
    );
    return result.rows[0];
  },

  // Update profile picture
  updateProfileImage: async (userId, imagePath) => {
    const result = await pool.query(
      `UPDATE "user" SET profile_image = $1
       WHERE id = $2
       RETURNING id, username, email, profile_image`,
      [imagePath, userId]
    );
    return result.rows[0];
  },

  // Save Expo push token for out-of-app notifications
  updatePushToken: async (userId, pushToken) => {
    const result = await pool.query(
      `UPDATE "user" SET push_token = $1
       WHERE id = $2
       RETURNING id, push_token`,
      [pushToken, userId]
    );
    return result.rows[0];
  },

  // Update password
  updatePassword: async (email, hashedPassword) => {
    await pool.query(
      'UPDATE "user" SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  },

  // Update streak value
  updateStreak: async (userId, newStreak) => {
    await pool.query(
      `UPDATE "user"
       SET streak = $1,
           best_streak = GREATEST(COALESCE(best_streak, 0), COALESCE(streak, 0), $1)
       WHERE id = $2`,
      [newStreak, userId]
    );
  },

  // Add XP directly (used by streak reward & achievement bonus)
  addXpDirect: async (userId, xpToAdd) => {
    await pool.query(
      `UPDATE "user" SET
        total_xp = total_xp + $1,
        level_xp = level_xp + $1,
        weekly_xp = weekly_xp + $1
       WHERE id = $2`,
      [xpToAdd, userId]
    );
  },

  // Save OTP with expiry (5 minutes)
  saveOtp: async (email, otp) => {
    await pool.query(
      `UPDATE "user"
       SET otp = $1,
           otp_expires_at = NOW() + INTERVAL '5 minutes'
       WHERE email = $2`,
      [otp, email]
    );
  },

  // Clear OTP
  clearOtp: async (email) => {
    await pool.query(
      `UPDATE "user"
       SET otp = NULL,
           otp_expires_at = NULL
       WHERE email = $1`,
      [email]
    );
  },

  // Create new user
  create: async (username, email, hashedPassword) => {
    const result = await pool.query(
      `INSERT INTO "user"
        (username, email, password, level,
         level_xp, total_xp, weekly_xp, streak, best_streak)
       VALUES ($1, $2, $3, 1, 0, 0, 0, 0, 0)
       RETURNING id, username, email,
                 level, level_xp, total_xp,
                 weekly_xp, streak, best_streak`,
      [username, email, hashedPassword]
    );
    return result.rows[0];
  },

  // Update user (admin)
  adminUpdate: async (id, username, email, current) => {
    const result = await pool.query(
      `UPDATE "user"
       SET username = $1, email = $2
       WHERE id = $3
       RETURNING id, username, email, level, total_xp`,
      [username || current.username, email || current.email, id]
    );
    return result.rows[0];
  },

  // Delete user (admin)
  deleteById: async (id) => {
    await pool.query(
      'DELETE FROM "user" WHERE id = $1', [id]
    );
  },

};

module.exports = userModel;
