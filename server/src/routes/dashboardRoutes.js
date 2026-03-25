const express = require('express');
const router = express.Router();

const {
  getStats,
  getResolutionMetrics,
  getRootCauseTrends,
  getUserStats,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'manager'), getStats);
router.get('/resolution-metrics', protect, authorize('admin', 'manager'), getResolutionMetrics);
router.get('/root-cause-trends', protect, authorize('admin', 'manager'), getRootCauseTrends);
router.get('/user-stats', protect, authorize('admin', 'manager'), getUserStats);
router.get('/recent-activity', protect, authorize('admin', 'manager'), getRecentActivity);

module.exports = router;
