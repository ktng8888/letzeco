const express = require('express');
const router = express.Router();
const friendshipController = require('../../controllers/user/friendshipController');
const verifyToken = require('../../middleware/authMiddleware');

// Note: /search, /requests, /sent must be BEFORE /:id
router.get('/search', verifyToken, friendshipController.searchUsers);
router.get('/requests', verifyToken, friendshipController.getPendingRequests);
router.get('/sent', verifyToken, friendshipController.getSentRequests);
router.get('/', verifyToken, friendshipController.getFriends);
router.post('/request/:id', verifyToken, friendshipController.sendRequest);
router.put('/approve/:id', verifyToken, friendshipController.approve);
router.delete('/reject/:id', verifyToken, friendshipController.reject);
router.delete('/cancel/:id', verifyToken, friendshipController.cancelRequest);
router.delete('/remove/:id', verifyToken, friendshipController.removeFriend);

module.exports = router;