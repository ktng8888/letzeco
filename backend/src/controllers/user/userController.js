const bcrypt = require('bcryptjs');
const userModel = require('../../models/userModel');

const userController = {

  // GET OWN PROFILE
  getProfile: async (req, res) => {
    const userId = req.user.id;
    try {
      const user = await userModel.getProfile(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const totalActions = await userModel.getTotalActions(userId);
      const totalBadges = await userModel.getTotalBadges(userId);
      const totalFriends = await userModel.getTotalFriends(userId);

      res.json({
        message: 'Profile retrieved successfully.',
        data: {
          ...user,
          total_actions: totalActions,
          total_badges: totalBadges,
          total_friends: totalFriends,
        }
      });

    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // VIEW OTHER USER PROFILE
  getUserById: async (req, res) => {
    const { id } = req.params;
    const myId = req.user.id;
    try {
      const user = await userModel.getPublicProfile(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check friendship status
      const friendship = await userModel.getFriendshipStatus(myId, id);

      let friendshipStatus = 'none';
      if (friendship) {
        if (friendship.status === 'approved') {
          friendshipStatus = 'friends';
        } else if (
          friendship.request_sender_user_id === parseInt(myId)
        ) {
          friendshipStatus = 'request_sent';
        } else {
          friendshipStatus = 'request_received';
        }
      }

      const totalBadges = await userModel.getTotalBadges(id);

      res.json({
        message: 'User profile retrieved successfully.',
        data: {
          ...user,
          total_badges: totalBadges,
          friendship_status: friendshipStatus
        }
      });

    } catch (err) {
      console.error('Get user by id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // EDIT USERNAME
  updateUsername: async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;
    try {
      if (username) {
        const existing = await userModel.findByUsername(username);
        if (existing && existing.id !== userId) {
          return res.status(400).json({
            message: 'Username already taken.'
          });
        }
      }

      const updated = await userModel.updateUsername(userId, username);

      res.json({
        message: 'Username updated successfully.',
        data: updated
      });

    } catch (err) {
      console.error('Update username error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // EDIT EMAIL
  updateEmail: async (req, res) => {
    const userId = req.user.id;
    const { email } = req.body;
    try {
      if (email) {
        const existing = await userModel.findByEmail(email);
        if (existing && existing.id !== userId) {
          return res.status(400).json({
            message: 'Email already taken.'
          });
        }
      }

      const updated = await userModel.updateEmail(userId, email);

      res.json({
        message: 'Email updated successfully.',
        data: updated
      });

    } catch (err) {
      console.error('Update email error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },


  // UPLOAD PROFILE PICTURE
  uploadProfilePicture: async (req, res) => {
    const userId = req.user.id;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded.' });
      }

      const imagePath = req.file.path.replace(/\\/g, '/');
      const updated = await userModel.updateProfileImage(userId, imagePath);

      res.json({
        message: 'Profile picture updated successfully.',
        data: { profile_image: updated.profile_image }
      });

    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CHANGE PASSWORD
  changePassword: async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    try {
      const user = await userModel.findById(userId);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Current password is incorrect.'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updatePassword(user.email, hashedPassword);

      res.json({ message: 'Password changed successfully.' });

    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = userController;
