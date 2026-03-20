const notificationModel = require('../../models/notificationModel');

const notificationController = {

  // GET ALL NOTIFICATIONS
  getAll: async (req, res) => {
    const userId = req.user.id;
    try {
      const notifications = await notificationModel.getByUserId(userId);
      const unreadCount = await notificationModel.getUnreadCount(userId);

      res.json({
        message: 'Notifications retrieved successfully.',
        data: {
          unread_count: unreadCount,
          notifications
        }
      });

    } catch (err) {
      console.error('Get notifications error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // MARK SINGLE AS READ
  markAsRead: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const notification = await notificationModel.getById(id);
      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found.'
        });
      }

      // Make sure it belongs to this user
      if (notification.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      const updated = await notificationModel.markAsRead(id);
      res.json({
        message: 'Notification marked as read.',
        data: updated
      });

    } catch (err) {
      console.error('Mark as read error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // MARK ALL AS READ
  markAllAsRead: async (req, res) => {
    const userId = req.user.id;
    try {
      await notificationModel.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
      console.error('Mark all as read error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE SINGLE NOTIFICATION
  delete: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      const notification = await notificationModel.getById(id);
      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found.'
        });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }

      await notificationModel.delete(id);
      res.json({ message: 'Notification deleted.' });

    } catch (err) {
      console.error('Delete notification error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE ALL NOTIFICATIONS
  deleteAll: async (req, res) => {
    const userId = req.user.id;
    try {
      await notificationModel.deleteAll(userId);
      res.json({ message: 'All notifications deleted.' });
    } catch (err) {
      console.error('Delete all notifications error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = notificationController;