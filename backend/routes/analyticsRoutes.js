const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.get('/dashboard', authorize('admin', 'teacher'), getDashboardMetrics);

module.exports = router;
