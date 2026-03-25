const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse } = require('../utils/apiResponse');

const getStats = async (req, res) => {
  const [
    complaintsByStatus,
    complaintsByCategory,
    complaintsByPriority,
    overdueComplaints,
    totalComplaints,
    totalUsers,
  ] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Complaint.countDocuments({ isOverdue: true }),
    Complaint.countDocuments(),
    User.countDocuments(),
  ]);

  const openEntry = complaintsByStatus.find((s) => s._id === 'open');
  const openComplaints = openEntry ? openEntry.count : 0;

  return successResponse(res, {
    totalUsers,
    totalComplaints,
    openComplaints,
    overdueComplaints,
    complaintsByStatus,
    complaintsByCategory,
    complaintsByPriority,
  });
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
    .populate('userId', 'name email role')
    .populate('targetUserId', 'name email')
    .sort({ createdAt: -1 })
    .limit(15);

  const formatted = logs.map((log) => ({
    _id: log._id,
    action: log.action,
    details: log.details,
    description: log.userId
      ? `${log.userId.name} — ${log.action}${log.details ? ': ' + log.details : ''}`
      : `${log.action}${log.details ? ': ' + log.details : ''}`,
    user: log.userId,
    targetUser: log.targetUserId,
    createdAt: log.createdAt,
  }));

  return successResponse(res, { logs: formatted });
};

module.exports = {
  getStats,
  getResolutionMetrics,
  getRootCauseTrends,
  getUserStats,
  getRecentActivity,
};
