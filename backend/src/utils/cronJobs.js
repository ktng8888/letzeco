// backend/src/utils/cronJobs.js
const cron = require('node-cron');
const userModel = require('../models/userModel');
const userActionModel = require('../models/userActionModel');
const challengeModel = require('../models/challengeModel');
const userChallengeModel = require('../models/userChallengeModel');
const challengeRewardModel = require('../models/challengeRewardModel');
const userChallengeRewardModel = require('../models/userChallengeRewardModel');
const xpService = require('./xpService');
const notificationService = require('./notificationService');
const weeklyXpService = require('./weeklyXpService');
const streakService = require('./streakService');

const processChallengeExpiry = async ({ catchUp = false } = {}) => {
  const expiredChallenges = catchUp
    ? await challengeModel.getMissedExpiredActive()
    : await challengeModel.getExpiredActive();

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
          participant => parseInt(participant.rank) === reward.top_value
        );

        for (const participant of eligible) {
          const alreadyAwarded = await userChallengeRewardModel
            .checkExists(participant.user_id, reward.id);

          if (alreadyAwarded) continue;

          await userChallengeRewardModel.create(
            participant.user_id, reward.id
          );

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
            const title = challenge.type === 'team'
              ? 'Team Ranking Reward Unlocked!'
              : 'Ranking Reward Unlocked!';
            const body = challenge.type === 'team'
              ? `Your team ranked Top ${reward.top_value} in "${challenge.name}"! Claim your reward in Gifts.`
              : `You ranked Top ${reward.top_value} in "${challenge.name}"! Claim your reward in Gifts.`;

            await notificationService.sendPush(
              user.push_token,
              title,
              body,
              { type: 'ranking_reward', challenge_id: challenge.id }
            );
          }
        }
      }
    }

    await userChallengeModel.finalizeByChallengeId(challenge.id);
    await challengeModel.markInactive(challenge.id);
    console.log(`Challenge ${challenge.id} marked as inactive.`);
  }
};

const startCronJobs = () => {
  // Streak reminder: every day at 12:00 PM.
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

  // Broken streak reset: every day shortly after midnight.
  cron.schedule('5 0 * * *', async () => {
    console.log('Running broken streak reset job...');
    try {
      await streakService.resetBrokenStreaks();
      console.log('Broken streak reset job done.');
    } catch (err) {
      console.error('Broken streak reset job error:', err);
    }
  });

  // Action deadline reminder: every minute.
  cron.schedule('* * * * *', async () => {
    try {
      const timingOutActions = await userModel.getUsersWithTimingOutActions();
      if (timingOutActions.length === 0) return;

      for (const action of timingOutActions) {
        await notificationService.actionTimeOutReminder(
          action.user_id,
          action.action_name,
          action.push_token,
          action.user_action_id
        );
      }
      console.log(`Sent ${timingOutActions.length} action time out reminder(s).`);
    } catch (err) {
      console.error('Action time out reminder job error:', err);
    }
  });

  // Expired in-progress action cancellation: every minute.
  cron.schedule('* * * * *', async () => {
    try {
      const cancelledActions = await userActionModel.cancelExpiredInProgress();
      if (cancelledActions.length > 0) {
        console.log(`Cancelled ${cancelledActions.length} expired action(s).`);
      }
    } catch (err) {
      console.error('Expired action cancellation job error:', err);
    }
  });

  // Challenge expiry: every day at 11:59 PM.
  cron.schedule('59 23 * * *', async () => {
    console.log('Running challenge expiry job...');
    try {
      await processChallengeExpiry();
      console.log('Challenge expiry job done.');
    } catch (err) {
      console.error('Challenge expiry job error:', err);
    }
  });

  // Weekly XP sync: every Monday at 12:00 AM.
  cron.schedule('0 0 * * 1', async () => {
    console.log('Running weekly XP sync job...');
    try {
      await weeklyXpService.syncWeeklyXp({ force: true });
      console.log('Weekly XP sync job done.');
    } catch (err) {
      console.error('Weekly XP sync job error:', err);
    }
  });

  // Extra safety: keep weekly XP aligned even if the backend missed a cron run.
  cron.schedule('0 * * * *', async () => {
    try {
      await weeklyXpService.syncWeeklyXp({ force: true });
    } catch (err) {
      console.error('Hourly weekly XP sync error:', err);
    }
  });

  weeklyXpService.syncWeeklyXp({ force: true })
    .then(() => console.log('Weekly XP startup sync done.'))
    .catch(err => console.error('Weekly XP startup sync error:', err));

  streakService.resetBrokenStreaks()
    .then(() => console.log('Broken streak startup check done.'))
    .catch(err => console.error('Broken streak startup check error:', err));

  // Catch up missed challenge expiry jobs after backend downtime.
  processChallengeExpiry({ catchUp: true })
    .then(() => console.log('Challenge expiry catch-up done.'))
    .catch(err => console.error('Challenge expiry catch-up error:', err));

  console.log('Cron jobs started!');
};

module.exports = { startCronJobs };
