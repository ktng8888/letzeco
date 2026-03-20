const friendshipModel = require('../../models/friendshipModel');
const userModel = require('../../models/userModel');
const notificationService = require('../../utils/notificationService');

const friendshipController = {

  // GET MY FRIENDS LIST
  getFriends: async (req, res) => {
    const userId = req.user.id;
    try {
      const friends = await friendshipModel.getFriends(userId);
      res.json({
        message: 'Friends retrieved successfully.',
        data: {
          total_friends: friends.length,
          friends
        }
      });
    } catch (err) {
      console.error('Get friends error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET PENDING REQUESTS (received)
  getPendingRequests: async (req, res) => {
    const userId = req.user.id;
    try {
      const requests = await friendshipModel.getPendingRequests(userId);
      res.json({
        message: 'Pending requests retrieved successfully.',
        data: {
          total_pending: requests.length,
          requests
        }
      });
    } catch (err) {
      console.error('Get pending requests error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET SENT REQUESTS
  getSentRequests: async (req, res) => {
    const userId = req.user.id;
    try {
      const requests = await friendshipModel.getSentRequests(userId);
      res.json({
        message: 'Sent requests retrieved successfully.',
        data: {
          total_sent: requests.length,
          requests
        }
      });
    } catch (err) {
      console.error('Get sent requests error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // SEARCH USERS
  searchUsers: async (req, res) => {
    const userId = req.user.id;
    const { query } = req.query;

    try {
      if (!query) {
        return res.status(400).json({
          message: 'Search query is required.'
        });
      }

      const users = await friendshipModel.searchUsers(query, userId);

      // Add friendship status to each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const friendship = await friendshipModel.checkExists(
            userId, user.id
          );

          let friendshipStatus = 'none';
          if (friendship) {
            if (friendship.status === 'approved') {
              friendshipStatus = 'friends';
            } else if (
              friendship.request_sender_user_id === parseInt(userId)
            ) {
              friendshipStatus = 'request_sent';
            } else {
              friendshipStatus = 'request_received';
            }
          }

          return {
            ...user,
            friendship_status: friendshipStatus,
            friendship_id: friendship ? friendship.id : null
          };
        })
      );

      res.json({
        message: 'Search results retrieved successfully.',
        data: {
          total_results: usersWithStatus.length,
          users: usersWithStatus
        }
      });

    } catch (err) {
      console.error('Search users error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // SEND FRIEND REQUEST
  sendRequest: async (req, res) => {
    const senderId = req.user.id;
    const { id } = req.params; // receiver id

    try {
      // Check receiver exists
      const receiver = await userModel.findById(id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Can't send request to yourself
      if (parseInt(id) === senderId) {
        return res.status(400).json({
          message: 'Cannot send friend request to yourself.'
        });
      }

      // Check if friendship already exists
      const existing = await friendshipModel.checkExists(senderId, id);
      if (existing) {
        if (existing.status === 'approved') {
          return res.status(400).json({
            message: 'Already friends.'
          });
        }
        return res.status(400).json({
          message: 'Friend request already sent or received.'
        });
      }

      const friendship = await friendshipModel.create(senderId, id);

      // Get sender username for notification
      const sender = await userModel.findById(senderId);

      // Notify receiver
      await notificationService.friendRequest(
        parseInt(id),
        sender.username
      );

      res.status(201).json({
        message: 'Friend request sent successfully.',
        data: friendship
      });

    } catch (err) {
      console.error('Send friend request error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // APPROVE FRIEND REQUEST
  approve: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // friendship id

    try {
      const friendship = await friendshipModel.getById(id);
      if (!friendship) {
        return res.status(404).json({
          message: 'Friend request not found.'
        });
      }

      // Only receiver can approve
      if (friendship.request_receiver_user_id !== userId) {
        return res.status(403).json({
          message: 'Not authorized to approve this request.'
        });
      }

      // Must be pending
      if (friendship.status !== 'pending') {
        return res.status(400).json({
          message: 'This request is not pending.'
        });
      }

      const approved = await friendshipModel.approve(id);

      // Notify sender that request was approved
      const approver = await userModel.findById(userId);

      // Get original sender's push token
      const originalSender = await userModel.findById(
        friendship.request_sender_user_id
      );

      // Friend approved — push + DB
      await notificationService.friendRequestApproved(
        friendship.request_sender_user_id,
        approver.username,
        originalSender.push_token  // ← push token needed
      );

      res.json({
        message: 'Friend request approved!',
        data: approved
      });

    } catch (err) {
      console.error('Approve friend request error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // REJECT FRIEND REQUEST
  reject: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // friendship id

    try {
      const friendship = await friendshipModel.getById(id);
      if (!friendship) {
        return res.status(404).json({
          message: 'Friend request not found.'
        });
      }

      // Only receiver can reject
      if (friendship.request_receiver_user_id !== userId) {
        return res.status(403).json({
          message: 'Not authorized to reject this request.'
        });
      }

      await friendshipModel.delete(id);

      res.json({ message: 'Friend request rejected.' });

    } catch (err) {
      console.error('Reject friend request error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // CANCEL SENT REQUEST
  cancelRequest: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // friendship id

    try {
      const friendship = await friendshipModel.getById(id);
      if (!friendship) {
        return res.status(404).json({
          message: 'Friend request not found.'
        });
      }

      // Only sender can cancel
      if (friendship.request_sender_user_id !== userId) {
        return res.status(403).json({
          message: 'Not authorized to cancel this request.'
        });
      }

      await friendshipModel.delete(id);

      res.json({ message: 'Friend request cancelled.' });

    } catch (err) {
      console.error('Cancel request error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // REMOVE FRIEND
  removeFriend: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // friendship id

    try {
      const friendship = await friendshipModel.getById(id);
      if (!friendship) {
        return res.status(404).json({
          message: 'Friendship not found.'
        });
      }

      // Only people in the friendship can remove
      if (
        friendship.request_sender_user_id !== userId &&
        friendship.request_receiver_user_id !== userId
      ) {
        return res.status(403).json({
          message: 'Not authorized.'
        });
      }

      await friendshipModel.delete(id);

      res.json({ message: 'Friend removed successfully.' });

    } catch (err) {
      console.error('Remove friend error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // VIEW FRIEND PROFILE
  getFriendProfile: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // friend user id

    try {
      const user = await userModel.getPublicProfile(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Get friendship status
      const friendship = await friendshipModel.checkExists(userId, id);
      let friendshipStatus = 'none';
      if (friendship) {
        if (friendship.status === 'approved') {
          friendshipStatus = 'friends';
        } else if (
          friendship.request_sender_user_id === parseInt(userId)
        ) {
          friendshipStatus = 'request_sent';
        } else {
          friendshipStatus = 'request_received';
        }
      }

      const totalBadges = await userModel.getTotalBadges(id);
      const totalActions = await userModel.getTotalActions(id);

      res.json({
        message: 'Friend profile retrieved successfully.',
        data: {
          ...user,
          total_badges: totalBadges,
          total_actions: totalActions,
          friendship_status: friendshipStatus,
          friendship_id: friendship ? friendship.id : null
        }
      });

    } catch (err) {
      console.error('Get friend profile error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = friendshipController;