const express = require('express');
const router = express.Router();
const favouriteController = require('../../controllers/user/favouriteController');
const verifyToken = require('../../middleware/authMiddleware');

router.get('/', verifyToken, favouriteController.getAll);
router.post('/:actionId', verifyToken, favouriteController.add);
router.delete('/:actionId', verifyToken, favouriteController.remove);

module.exports = router;