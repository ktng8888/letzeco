const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/adminUserController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminUserController.getAll);
router.get('/:id', verifyAdmin, adminUserController.getById);
router.post('/', verifyAdmin, adminUserController.create);
router.put('/:id', verifyAdmin, adminUserController.update);
router.delete('/:id', verifyAdmin, adminUserController.delete);

module.exports = router;