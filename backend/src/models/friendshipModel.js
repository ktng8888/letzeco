const pool = require('../config/db');

const friendshipModel = {

  // Get all friends of a user
  getFriends: async (userId) => {
    const result = await pool.query(
      `SELECT
        f.id AS friendship_id,
        f.approved_date,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN f.request_receiver_user_id
          ELSE f.request_sender_user_id
        END AS friend_id,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN ru.username
          ELSE su.username
        END AS friend_username,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN ru.profile_image
          ELSE su.profile_image
        END AS friend_profile_image,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN ru.level
          ELSE su.level
        END AS friend_level,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN ru.total_xp
          ELSE su.total_xp
        END AS friend_total_xp,
        CASE
          WHEN f.request_sender_user_id = $1
            THEN ru.weekly_xp
          ELSE su.weekly_xp
        END AS friend_weekly_xp
       FROM friendship f
       LEFT JOIN "user" su ON f.request_sender_user_id = su.id
       LEFT JOIN "user" ru ON f.request_receiver_user_id = ru.id
       WHERE (f.request_sender_user_id = $1
         OR f.request_receiver_user_id = $1)
       AND f.status = 'approved'
       ORDER BY f.approved_date DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get pending requests (received by user)
  getPendingRequests: async (userId) => {
    const result = await pool.query(
      `SELECT
        f.id AS friendship_id,
        u.id AS sender_id,
        u.username AS sender_username,
        u.profile_image AS sender_profile_image,
        u.level AS sender_level
       FROM friendship f
       LEFT JOIN "user" u ON f.request_sender_user_id = u.id
       WHERE f.request_receiver_user_id = $1
       AND f.status = 'pending'
       ORDER BY f.id DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get sent requests (sent by user)
  getSentRequests: async (userId) => {
    const result = await pool.query(
      `SELECT
        f.id AS friendship_id,
        u.id AS receiver_id,
        u.username AS receiver_username,
        u.profile_image AS receiver_profile_image,
        u.level AS receiver_level
       FROM friendship f
       LEFT JOIN "user" u ON f.request_receiver_user_id = u.id
       WHERE f.request_sender_user_id = $1
       AND f.status = 'pending'
       ORDER BY f.id DESC`,
      [userId]
    );
    return result.rows;
  },

  // Check friendship status between two users
  checkExists: async (userId1, userId2) => {
    const result = await pool.query(
      `SELECT * FROM friendship
       WHERE (request_sender_user_id = $1
         AND request_receiver_user_id = $2)
       OR (request_sender_user_id = $2
         AND request_receiver_user_id = $1)`,
      [userId1, userId2]
    );
    return result.rows[0];
  },

  // Get friendship by id
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM friendship WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  // Send friend request
  create: async (senderId, receiverId) => {
    const result = await pool.query(
      `INSERT INTO friendship
        (request_sender_user_id, request_receiver_user_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [senderId, receiverId]
    );
    return result.rows[0];
  },

  // Approve friend request
  approve: async (id) => {
    const result = await pool.query(
      `UPDATE friendship
       SET status = 'approved', approved_date = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Delete friendship (reject or remove)
  delete: async (id) => {
    await pool.query(
      'DELETE FROM friendship WHERE id = $1', [id]
    );
  },

  // Search users by username or id
  searchUsers: async (query, myId) => {
    const result = await pool.query(
      `SELECT id, username, profile_image, level
       FROM "user"
       WHERE (
         LOWER(username) LIKE LOWER($1)
         OR CAST(id AS TEXT) = $2
       )
       AND id != $3
       ORDER BY username ASC
       LIMIT 20`,
      [`%${query}%`, query, myId]
    );
    return result.rows;
  },

};

module.exports = friendshipModel;