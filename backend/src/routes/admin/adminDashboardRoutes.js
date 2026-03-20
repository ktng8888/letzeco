const express = require('express');
const router = express.Router();
const adminDashboardController = require('../../controllers/admin/adminDashboardController');
const verifyAdmin = require('../../middleware/adminMiddleware');

router.get('/', verifyAdmin, adminDashboardController.getDashboard);

module.exports = router;