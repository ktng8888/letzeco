const express = require('express');
const router = express.Router();
const actionController = require('../../controllers/user/actionController');
const verifyToken = require('../../middleware/authMiddleware');

// Note: /popular and /recommended must be
// BEFORE /:id to avoid conflict
router.get('/popular', verifyToken, actionController.getPopular);
router.get('/recommended', verifyToken, actionController.getRecommended);
router.get('/category/:categoryId', verifyToken, actionController.getByCategory);
router.get('/:id', verifyToken, actionController.getById);
router.get('/', verifyToken, actionController.getAll);

module.exports = router;