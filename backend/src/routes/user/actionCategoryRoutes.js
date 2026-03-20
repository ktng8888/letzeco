const express = require('express');
const router = express.Router();
const actionCategoryController = require('../../controllers/user/actionCategoryController');
const verifyToken = require('../../middleware/authMiddleware');

router.get('/', verifyToken, actionCategoryController.getAll);
router.get('/:id', verifyToken, actionCategoryController.getById);

module.exports = router;