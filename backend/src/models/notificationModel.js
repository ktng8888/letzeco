const pool = require('../config/db');

const notificationModel = {

  // Get all notifications for user
  getByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT * FROM notification
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notification
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get single notification
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM notification WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  // Create notification
  create: async (userId, title, message, type, relatedId) => {
    const result = await pool.query(
      `INSERT INTO notification
        (user_id, title, message, type, is_read,
         created_at, related_id)
       VALUES ($1, $2, $3, $4, false, NOW(), $5)
       RETURNING *`,
      [userId, title, message, type, relatedId || null]
    );
    return result.rows[0];
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const result = await pool.query(
      `UPDATE notification SET is_read = true
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    await pool.query(
      `UPDATE notification SET is_read = true
       WHERE user_id = $1`,
      [userId]
    );
  },

  // Delete notification
  delete: async (id) => {
    await pool.query(
      'DELETE FROM notification WHERE id = $1', [id]
    );
  },

  // Delete all notifications for user
  deleteAll: async (userId) => {
    await pool.query(
      'DELETE FROM notification WHERE user_id = $1', [userId]
    );
  },

};

module.exports = notificationModel;