const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateProfile,
  activateUser,
  suspendUser,
  deactivateUser,
  deleteUser,
  getUserActivity,
  getStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');

router.get('/', protect, authorize('admin', 'manager'), getAllUsers);
router.get('/stats', protect, authorize('admin', 'manager'), getStats);

router.get('/:id', protect, getUserById);
router.put('/profile', protect, uploadSingle, validateUpdateProfile, updateProfile);

router.patch('/:id/activate', protect, authorize('admin', 'manager'), activateUser);
router.patch('/:id/suspend', protect, authorize('admin', 'manager'), suspendUser);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager'), deactivateUser);

router.get('/:id/activity', protect, authorize('admin', 'manager'), getUserActivity);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
