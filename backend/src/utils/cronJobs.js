// backend/src/utils/cronJobs.js  (FULL REPLACEMENT)
const cron                     = require('node-cron');
const userModel                = require('../models/userModel');
const challengeModel           = require('../models/challengeModel');
const challengeRewardModel     = require('../models/challengeRewardModel');
const userChallengeRewardModel = require('../models/userChallengeRewardModel');
const xpService                = require('./xpService');       // ← ADD
const notificationService      = require('./notificationService');

const startCronJobs = () => {

  // ─────────────────────────────────────────────────────────────────────────
  // STREAK REMINDER — every day at 12:00 PM
  // ─────────────────────────────────────────────────────────────────────────
  cron.schedule('0 12 * * *', async () => {
    console.log('Running streak reminder job...');
    try {
      const users = await userModel.getUsersForStreakReminder();
      for (const user of users) {
        await notificationService.streakReminder(
          user.id, user.streak, user.push_token
        );
      }
      console.log('Streak reminder job completed.');
    } catch (err) {
      console.error('Streak reminder job error:', err);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DEADLINE REMINDER — every day at 9:00 AM
  // ─────────────────────────────────────────────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('Running deadline reminder job...');
    try {
      const users = await userModel.getUsersForDeadlineReminder();
      for (const user of users) {
        await notificationService.deadlineReminder(
          user.id, user.challenge_name, user.push_token
        );
      }
      console.log('Deadline reminder job completed.');
    } catch (err) {
      console.error('Deadline reminder job error:', err);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHALLENGE COMPLETION — every day at 11:59 PM
  // Distributes ranking rewards → marks challenges as completed
  // Also checks team challenge achievements for each rewarded user
  // ─────────────────────────────────────────────────────────────────────────
  cron.schedule('59 23 * * *', async () => {
    console.log('Running challenge completion job...');
    try {
      const expiredChallenges = await challengeModel.getExpiredActive();
      console.log(`Found ${expiredChallenges.length} expired challenge(s)`);

      for (const challenge of expiredChallenges) {
        console.log(`Processing: ${challenge.name} (id: ${challenge.id})`);

        const rankingRewards = await challengeRewardModel
          .getRankingRewards(challenge.id);

        if (rankingRewards.length > 0) {
          const ranked = challenge.type === 'solo'
            ? await challengeModel.getSoloRankings(challenge.id)
            : await challengeModel.getTeamRankings(challenge.id);

          for (const reward of rankingRewards) {
            const eligible = ranked.filter(
              r => parseInt(r.rank) <= reward.top_value
            );

            for (const participant of eligible) {
              const alreadyAwarded = await userChallengeRewardModel
                .checkExists(participant.user_id, reward.id);

              if (!alreadyAwarded) {
                await userChallengeRewardModel.create(
                  participant.user_id, reward.id
                );

                // ── NEW: check team challenge achievement for this user ──
                if (challenge.type === 'team') {
                  try {
                    await xpService.checkTeamChallengeAchievement(
                      participant.user_id
                    );
                  } catch (achErr) {
                    console.warn(
                      `Team challenge achievement check failed for user ${participant.user_id}:`,
                      achErr.message
                    );
                  }
                } else {
                  try {
                    await xpService.checkChallengeAchievement(
                      participant.user_id
                    );
                  } catch (achErr) {
                    console.warn(
                      `Challenge achievement check failed for user ${participant.user_id}:`,
                      achErr.message
                    );
                  }
                }

                const user = await userModel.findById(participant.user_id);
                if (user?.push_token) {
                  await notificationService.sendPush(
                    user.push_token,
                    '🏆 Ranking Reward Unlocked!',
                    `You ranked Top ${reward.top_value} in "${challenge.name}"! Claim your reward in Gifts.`,
                    { type: 'ranking_reward', challenge_id: challenge.id }
                  );
                }
              }
            }
          }
        }

        await challengeModel.markCompleted(challenge.id);
        console.log(`Challenge ${challenge.id} marked as completed.`);
      }

      console.log('Challenge completion job done.');
    } catch (err) {
      console.error('Challenge completion job error:', err);
    }
  });

  console.log('Cron jobs started!');
};

module.exports = { startCronJobs };