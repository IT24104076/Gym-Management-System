const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse } = require('../utils/apiResponse');

const getStats = async (req, res) => {
  const [byStatus, byCategory, byPriority, overdueCount, total] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Complaint.countDocuments({ isOverdue: true }),
    Complaint.countDocuments(),
  ]);

  return successResponse(res, { total, byStatus, byCategory, byPriority, overdueCount });
};

const getResolutionMetrics = async (req, res) => {
  const resolved = await Complaint.find({
    status: { $in: ['resolved', 'closed'] },
    resolvedAt: { $exists: true },
  }).select('createdAt resolvedAt');

  let averageResolutionTimeMs = 0;
  if (resolved.length > 0) {
    const totalMs = resolved.reduce((acc, c) => {
      return acc + (new Date(c.resolvedAt) - new Date(c.createdAt));
    }, 0);
    averageResolutionTimeMs = totalMs / resolved.length;
  }

  const averageResolutionHours = Math.round(averageResolutionTimeMs / (1000 * 60 * 60));
  const averageResolutionDays = +(averageResolutionTimeMs / (1000 * 60 * 60 * 24)).toFixed(2);

  return successResponse(res, {
    totalResolved: resolved.length,
    averageResolutionHours,
    averageResolutionDays,
  });
};

const getRootCauseTrends = async (req, res) => {
  const trends = await Complaint.aggregate([
    { $match: { rootCause: { $exists: true, $ne: null, $ne: '' } } },
    { $group: { _id: '$rootCause', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  return successResponse(res, { trends });
};

const getUserStats = async (req, res) => {
  const [byRole, byStatus, total] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments(),
  ]);

  return successResponse(res, { total, byRole, byStatus });
};

const getRecentActivity = async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('userId', 'name email')
    .populate('targetUserId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  return successResponse(res, { logs });
};

module.exports = {
  getStats,
  getResolutionMetrics,
  getRootCauseTrends,
  getUserStats,
  getRecentActivity,
};
