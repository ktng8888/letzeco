const pool = require('../config/db');

const leaderboardModel = {

  // Get global leaderboard
  getGlobal: async (limit) => {
    const result = await pool.query(
      `SELECT id, username, profile_image,
              level, total_xp, weekly_xp, streak
       FROM "user"
       ORDER BY weekly_xp DESC, level DESC,
                total_xp DESC, streak DESC, id ASC
       LIMIT $1`,
      [limit || 100]
    );
    return result.rows;
  },

  // Get friends leaderboard
  getFriends: async (userId) => {
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_image,
              u.level, u.total_xp, u.weekly_xp, u.streak
       FROM "user" u
       WHERE u.id = $1
       OR u.id IN (
         SELECT CASE
           WHEN f.request_sender_user_id = $1
             THEN f.request_receiver_user_id
           ELSE f.request_sender_user_id
         END
         FROM friendship f
         WHERE (f.request_sender_user_id = $1
           OR f.request_receiver_user_id = $1)
         AND f.status = 'approved'
       )
       ORDER BY weekly_xp DESC, level DESC,
                total_xp DESC, streak DESC, id ASC`,
      [userId]
    );
    return result.rows;
  },

  // Get user rank in global leaderboard
  getUserGlobalRank: async (userId) => {
    const result = await pool.query(
      `SELECT rank
       FROM (
         SELECT id,
                ROW_NUMBER() OVER (
                  ORDER BY weekly_xp DESC, level DESC,
                           total_xp DESC, streak DESC, id ASC
                ) AS rank
         FROM "user"
       ) ranked_users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] ? parseInt(result.rows[0].rank) : null;
  },

  // Get user rank in friends leaderboard
  getUserFriendsRank: async (userId) => {
    const result = await pool.query(
      `SELECT rank
       FROM (
         SELECT u.id,
                ROW_NUMBER() OVER (
                  ORDER BY u.weekly_xp DESC, u.level DESC,
                           u.total_xp DESC, u.streak DESC, u.id ASC
                ) AS rank
         FROM "user" u
         WHERE u.id = $1
         OR u.id IN (
             SELECT CASE
               WHEN f.request_sender_user_id = $1
                 THEN f.request_receiver_user_id
               ELSE f.request_sender_user_id
             END
             FROM friendship f
             WHERE (f.request_sender_user_id = $1
               OR f.request_receiver_user_id = $1)
             AND f.status = 'approved'
           )
       )
       ranked_users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] ? parseInt(result.rows[0].rank) : null;
  },

};

module.exports = leaderboardModel;
