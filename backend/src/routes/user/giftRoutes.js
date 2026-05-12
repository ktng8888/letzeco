// backend/src/routes/user/giftRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware');
const giftController = require('../../controllers/user/giftController');

router.get('/',           verifyToken, giftController.getGifts);
router.post('/:id/claim', verifyToken, giftController.claimGift);

module.exports = router;


// ─────────────────────────────────────────────────────────────────────────────
// ADD TO backend/src/app.js  (2 lines only — do NOT replace the whole file)
// ─────────────────────────────────────────────────────────────────────────────
//
// 1) Near the other user route requires at the top, add:
//    const giftRoutes = require('./routes/user/giftRoutes');
//
// 2) Near the other app.use() calls, add:
//    app.use('/api/gifts', giftRoutes);
//
// ─────────────────────────────────────────────────────────────────────────────