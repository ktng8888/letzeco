const pool = require('../config/db');

const mapEmblemRow = (row) => ({
  user_emblem_id: row.user_emblem_id,
  slot: row.slot,
  user_badge_id: row.user_badge_id,
  badge_id: row.badge_id,
  source_type: row.source_type,
  source_id: row.source_id,
  status: row.status,
  badge_name: row.badge_name,
  badge_image: row.badge_image,
  badge_type: row.badge_type,
  achievement_name: row.achievement_name,
  challenge_name: row.challenge_name,
  owned_by_viewer: row.owned_by_viewer,
});

const userBadgeModel = {
  createForAchievement: async (userId, achievementId) => {
    const badgeResult = await pool.query(
      `SELECT badge_id FROM achievement WHERE id = $1 AND badge_id IS NOT NULL`,
      [achievementId]
    );
    const badgeId = badgeResult.rows[0]?.badge_id;
    if (!badgeId) return null;

    const existing = await pool.query(
      `SELECT * FROM user_badge
       WHERE user_id = $1 AND source_type = 'achievement' AND source_id = $2`,
      [userId, achievementId]
    );
    if (existing.rows[0]) return existing.rows[0];

    const result = await pool.query(
      `INSERT INTO user_badge (user_id, badge_id, source_type, source_id, status)
       VALUES ($1, $2, 'achievement', $3, 'unlocked')
       RETURNING *`,
      [userId, badgeId, achievementId]
    );
    return result.rows[0];
  },

  createForChallengeReward: async (userId, userChallengeRewardId) => {
    const badgeResult = await pool.query(
      `SELECT cr.badge_id
       FROM user_challenge_reward ucr
       JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       WHERE ucr.id = $1
         AND ucr.user_id = $2
         AND ucr.status = 'claimed'
         AND cr.badge_id IS NOT NULL`,
      [userChallengeRewardId, userId]
    );
    const badgeId = badgeResult.rows[0]?.badge_id;
    if (!badgeId) return null;

    const existing = await pool.query(
      `SELECT * FROM user_badge
       WHERE user_id = $1 AND source_type = 'challenge_reward' AND source_id = $2`,
      [userId, userChallengeRewardId]
    );
    if (existing.rows[0]) return existing.rows[0];

    const result = await pool.query(
      `INSERT INTO user_badge (user_id, badge_id, source_type, source_id, status)
       VALUES ($1, $2, 'challenge_reward', $3, 'claimed')
       RETURNING *`,
      [userId, badgeId, userChallengeRewardId]
    );
    return result.rows[0];
  },

  syncForUser: async (userId) => {
    await pool.query(
      `INSERT INTO user_badge (user_id, badge_id, source_type, source_id, status)
       SELECT ua.user_id, a.badge_id, 'achievement', ua.achievement_id, 'unlocked'
       FROM user_achievement ua
       JOIN achievement a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
         AND a.badge_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM user_badge ub
           WHERE ub.user_id = ua.user_id
             AND ub.source_type = 'achievement'
             AND ub.source_id = ua.achievement_id
         )`,
      [userId]
    );

    await pool.query(
      `INSERT INTO user_badge (user_id, badge_id, source_type, source_id, status)
       SELECT ucr.user_id, cr.badge_id, 'challenge_reward', ucr.id, 'claimed'
       FROM user_challenge_reward ucr
       JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       WHERE ucr.user_id = $1
         AND ucr.status = 'claimed'
         AND cr.badge_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM user_badge ub
           WHERE ub.user_id = ucr.user_id
             AND ub.source_type = 'challenge_reward'
             AND ub.source_id = ucr.id
         )`,
      [userId]
    );
  },

  getSelectableByUser: async (userId) => {
    await userBadgeModel.syncForUser(userId);
    const result = await pool.query(
      `SELECT
         ub.id AS user_badge_id,
         ub.user_id,
         ub.badge_id,
         ub.source_type,
         ub.source_id,
         ub.status,
         b.name AS badge_name,
         b.image AS badge_image,
         b.type AS badge_type,
         a.name AS achievement_name,
         c.name AS challenge_name
       FROM user_badge ub
       JOIN badge b ON ub.badge_id = b.id
       LEFT JOIN achievement a
         ON ub.source_type = 'achievement' AND ub.source_id = a.id
       LEFT JOIN user_challenge_reward ucr
         ON ub.source_type = 'challenge_reward' AND ub.source_id = ucr.id
       LEFT JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       LEFT JOIN challenge c ON cr.challenge_id = c.id
       WHERE ub.user_id = $1
         AND ub.status IN ('unlocked', 'claimed')
       ORDER BY ub.id DESC`,
      [userId]
    );
    return result.rows;
  },

  getEmblemsByUser: async (userId, viewerId = userId) => {
    await userBadgeModel.syncForUser(userId);
    if (viewerId) await userBadgeModel.syncForUser(viewerId);
    const result = await pool.query(
      `SELECT
         ue.id AS user_emblem_id,
         ue.slot,
         ub.id AS user_badge_id,
         ub.badge_id,
         ub.source_type,
         ub.source_id,
         ub.status,
         b.name AS badge_name,
         b.image AS badge_image,
         b.type AS badge_type,
         a.name AS achievement_name,
         c.name AS challenge_name,
         EXISTS (
           SELECT 1
           FROM user_badge viewer_badge
           WHERE viewer_badge.user_id = $2
             AND viewer_badge.badge_id = ub.badge_id
             AND viewer_badge.status IN ('unlocked', 'claimed')
         ) AS owned_by_viewer
       FROM user_emblem ue
       JOIN user_badge ub ON ue.user_badge_id = ub.id
       JOIN badge b ON ub.badge_id = b.id
       LEFT JOIN achievement a
         ON ub.source_type = 'achievement' AND ub.source_id = a.id
       LEFT JOIN user_challenge_reward ucr
         ON ub.source_type = 'challenge_reward' AND ub.source_id = ucr.id
       LEFT JOIN challenge_reward cr ON ucr.challenge_reward_id = cr.id
       LEFT JOIN challenge c ON cr.challenge_id = c.id
       WHERE ue.user_id = $1
         AND ub.user_id = $1
         AND ub.status IN ('unlocked', 'claimed')
       ORDER BY ue.slot ASC`,
      [userId, viewerId || userId]
    );
    return result.rows.map(mapEmblemRow);
  },

  setEmblems: async (userId, userBadgeIds) => {
    const ids = [...new Set(
      (Array.isArray(userBadgeIds) ? userBadgeIds : [])
        .map(id => parseInt(id, 10))
        .filter(Number.isInteger)
    )];

    if (ids.length > 3) {
      const error = new Error('You can select up to 3 emblems.');
      error.statusCode = 400;
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (ids.length > 0) {
        const owned = await client.query(
          `SELECT id FROM user_badge
           WHERE user_id = $1
             AND id = ANY($2::int[])
             AND status IN ('unlocked', 'claimed')`,
          [userId, ids]
        );
        if (owned.rows.length !== ids.length) {
          const error = new Error('One or more selected badges are not available.');
          error.statusCode = 400;
          throw error;
        }
      }

      await client.query('DELETE FROM user_emblem WHERE user_id = $1', [userId]);

      for (let index = 0; index < ids.length; index++) {
        await client.query(
          `INSERT INTO user_emblem (user_id, user_badge_id, slot)
           VALUES ($1, $2, $3)`,
          [userId, ids[index], index + 1]
        );
      }

      await client.query('COMMIT');
      return await userBadgeModel.getEmblemsByUser(userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  attachEmblemsToUsers: async (users) => {
    if (!Array.isArray(users) || users.length === 0) return users;
    const userIds = users.map(user => user.id);
    const result = await pool.query(
      `SELECT
         ue.user_id,
         ue.id AS user_emblem_id,
         ue.slot,
         ub.id AS user_badge_id,
         ub.badge_id,
         ub.source_type,
         ub.source_id,
         ub.status,
         b.name AS badge_name,
         b.image AS badge_image,
         b.type AS badge_type
       FROM user_emblem ue
       JOIN user_badge ub ON ue.user_badge_id = ub.id
       JOIN badge b ON ub.badge_id = b.id
       WHERE ue.user_id = ANY($1::int[])
         AND ub.user_id = ue.user_id
         AND ub.status IN ('unlocked', 'claimed')
       ORDER BY ue.user_id, ue.slot ASC`,
      [userIds]
    );

    const byUser = new Map();
    result.rows.forEach((row) => {
      if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
      byUser.get(row.user_id).push(mapEmblemRow(row));
    });

    return users.map(user => ({
      ...user,
      emblems: byUser.get(user.id) || [],
    }));
  },
};

module.exports = userBadgeModel;
