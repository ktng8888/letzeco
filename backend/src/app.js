const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/db');

// User routes
const authRoutes = require('./routes/user/authRoutes');
const userRoutes = require('./routes/user/userRoutes');
const actionCategoryRoutes = require('./routes/user/actionCategoryRoutes');
const actionRoutes = require('./routes/user/actionRoutes');
const userActionRoutes = require('./routes/user/userActionRoutes');
const proofRoutes = require('./routes/user/proofRoutes');
const favouriteRoutes = require('./routes/user/favouriteRoutes');
const challengeRoutes = require('./routes/user/challengeRoutes');
const teamRoutes = require('./routes/user/teamRoutes');
const leaderboardRoutes = require('./routes/user/leaderboardRoutes');
const progressRoutes = require('./routes/user/progressRoutes');
const friendshipRoutes = require('./routes/user/friendshipRoutes');
const achievementRoutes = require('./routes/user/achievementRoutes');
const notificationRoutes = require('./routes/user/notificationRoutes');
const streakRoutes = require('./routes/user/streakRoutes');

// Admin routes
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminActionCategoryRoutes = require('./routes/admin/adminActionCategoryRoutes');
const adminActionRoutes = require('./routes/admin/adminActionRoutes');
const adminBadgeRoutes = require('./routes/admin/adminBadgeRoutes');
const adminAchievementRoutes = require('./routes/admin/adminAchievementRoutes');
const adminStreakRewardRoutes = require('./routes/admin/adminStreakRewardRoutes');
const adminChallengeRoutes = require('./routes/admin/adminChallengeRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoutes');
const adminManageRoutes = require('./routes/admin/adminManageRoutes');
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));

// User routes
app.use('/api/auth', authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/categories',actionCategoryRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/user-actions', userActionRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/streak', streakRoutes);

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/categories', adminActionCategoryRoutes);
app.use('/api/admin/actions', adminActionRoutes);
app.use('/api/admin/badges', adminBadgeRoutes);
app.use('/api/admin/achievements', adminAchievementRoutes);
app.use('/api/admin/streak-rewards', adminStreakRewardRoutes);
app.use('/api/admin/challenges', adminChallengeRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/admins',adminManageRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LetzECO API is running!' });
});

module.exports = app;