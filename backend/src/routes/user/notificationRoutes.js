const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/user/notificationController');
const verifyToken = require('../../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getAll);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/delete-all', verifyToken, notificationController.deleteAll);
router.delete('/:id', verifyToken, notificationController.delete);

module.exports = router;