// backend/src/controllers/user/giftController.js
const userChallengeRewardModel = require('../../models/userChallengeRewardModel');
const xpService                = require('../../utils/xpService');
const userModel                = require('../../models/userModel');

const giftController = {

  // GET /api/gifts
  getGifts: async (req, res) => {
    const userId = req.user.id;
    try {
      const gifts = await userChallengeRewardModel.getUnclaimedByUser(userId);
      res.json({
        message: 'Gifts retrieved.',
        data: { count: gifts.length, gifts }
      });
    } catch (err) {
      console.error('Get gifts error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // POST /api/gifts/:id/claim
  claimGift: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const gift = await userChallengeRewardModel.getById(id);

      if (!gift) {
        return res.status(404).json({ message: 'Gift not found.' });
      }
      if (gift.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (gift.status === 'claimed') {
        return res.status(400).json({ message: 'Gift already claimed.' });
      }

      // Add XP if reward has XP
      let xpResult = null;
      if (gift.xp_reward > 0) {
        xpResult = await xpService.addXP(userId, gift.xp_reward);
      }

      await userChallengeRewardModel.claim(id);

      const user = await userModel.getProfile(userId);

      res.json({
        message: 'Gift claimed!',
        data: {
          xp_reward:      gift.xp_reward,
          badge_name:     gift.badge_name,
          badge_image:    gift.badge_image,
          challenge_name: gift.challenge_name,
          type:           gift.type,
          level_up:       xpResult?.level_up || false,
          new_level:      xpResult?.new_level || null,
          user: {
            level:     user.level,
            level_xp:  user.level_xp,
            total_xp:  user.total_xp,
            weekly_xp: user.weekly_xp,
          }
        }
      });

    } catch (err) {
      console.error('Claim gift error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = giftController;