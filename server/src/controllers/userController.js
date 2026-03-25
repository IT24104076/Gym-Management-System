const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return successResponse(res, {
    users,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }
  return successResponse(res, { user });
};

const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'phone', 'address', 'dateOfBirth'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.file) {
    updates.avatar = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await ActivityLog.create({
    userId: req.user._id,
    action: 'Profile updated',
    ipAddress: req.ip,
  });

  return successResponse(res, { user }, 'Profile updated successfully');
};

const activateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);

  user.status = 'active';
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    userId: req.user._id,
    action: 'User activated',
    targetUserId: user._id,
    details: `User ${user.email} was activated`,
    ipAddress: req.ip,
  });

  return successResponse(res, { user }, 'User activated successfully');
};

const suspendUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);

  user.status = 'suspended';
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    userId: req.user._id,
    action: 'User suspended',
    targetUserId: user._id,
    details: `User ${user.email} was suspended`,
    ipAddress: req.ip,
  });

  return successResponse(res, { user }, 'User suspended successfully');
};

const deactivateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);

  user.status = 'deactivated';
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    userId: req.user._id,
    action: 'User deactivated',
    targetUserId: user._id,
    details: `User ${user.email} was deactivated`,
    ipAddress: req.ip,
  });

  return successResponse(res, { user }, 'User deactivated successfully');
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);

  user.status = 'deactivated';
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    userId: req.user._id,
    action: 'User deleted (deactivated)',
    targetUserId: user._id,
    details: `User ${user.email} was soft-deleted`,
    ipAddress: req.ip,
  });

  return successResponse(res, null, 'User deleted successfully');
};

const getUserActivity = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);

  const [logs, total] = await Promise.all([
    ActivityLog.find({ $or: [{ userId: user._id }, { targetUserId: user._id }] })
      .populate('userId', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments({ $or: [{ userId: user._id }, { targetUserId: user._id }] }),
  ]);

  return successResponse(res, {
    logs,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

const getStats = async (req, res) => {
  const [byRole, byStatus] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const total = await User.countDocuments();

  return successResponse(res, { total, byRole, byStatus });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  activateUser,
  suspendUser,
  deactivateUser,
  deleteUser,
  getUserActivity,
  getStats,
};
