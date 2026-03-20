const cron = require('node-cron');
const userModel = require('../models/userModel');
const notificationService = require('./notificationService');

const startCronJobs = () => {

  // ─────────────────────────────────────────
  // STREAK REMINDER
  // Runs every day at 12:00 PM (noon)
  // Reminds users who haven't logged today
  // ─────────────────────────────────────────
  cron.schedule('0 12 * * *', async () => {
    console.log('Running streak reminder job...');
    try {
      const users = await userModel.getUsersForStreakReminder();
      console.log(`Found ${users.length} users at streak risk`);

      for (const user of users) {
        await notificationService.streakReminder(
          user.id,
          user.streak,
          user.push_token
        );
      }

      console.log('Streak reminder job completed.');
    } catch (err) {
      console.error('Streak reminder job error:', err);
    }
  });

  // ─────────────────────────────────────────
  // DEADLINE REMINDER
  // Runs every day at 9:00 AM
  // Reminds users of challenges ending tomorrow
  // ─────────────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('Running deadline reminder job...');
    try {
      const users = await userModel.getUsersForDeadlineReminder();
      console.log(`Found ${users.length} users with ending challenges`);

      for (const user of users) {
        await notificationService.deadlineReminder(
          user.id,
          user.challenge_name,
          user.push_token
        );
      }

      console.log('Deadline reminder job completed.');
    } catch (err) {
      console.error('Deadline reminder job error:', err);
    }
  });

  console.log('Cron jobs started!');
};

module.exports = { startCronJobs };