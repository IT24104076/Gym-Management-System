const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  addComment,
  escalateComplaint,
  resolveComplaint,
  getComplaintHistory,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validate');
const { uploadMultiple } = require('../middleware/upload');

router.post('/', protect, uploadMultiple, validateComplaint, createComplaint);
router.get('/', protect, getAllComplaints);

// "my" route must be before /:id to avoid route conflict
router.get('/my', protect, authorize('member', 'trainer'), (req, res, next) => {
  req.query.ownOnly = true;
  next();
}, getAllComplaints);

router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, authorize('admin', 'manager'), updateComplaintStatus);
router.patch('/:id/assign', protect, authorize('admin', 'manager'), assignComplaint);
router.post('/:id/comments', protect, addComment);
router.post('/:id/comment', protect, addComment);
router.patch('/:id/escalate', protect, authorize('admin', 'manager'), escalateComplaint);
router.patch('/:id/resolve', protect, authorize('admin', 'manager'), resolveComplaint);
router.get('/:id/history', protect, getComplaintHistory);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

module.exports = router;
