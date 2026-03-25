const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const { generateComplaintId } = require('../utils/generateId');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getDueDateByPriority = (priority) => {
  const now = new Date();
  const days = priority === 'urgent' || priority === 'high' ? 3 : priority === 'medium' ? 7 : 14;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

const createComplaint = async (req, res) => {
  const { title, description, category, priority, sourceChannel } = req.body;

  const complaintId = await generateComplaintId();
  const dueDate = getDueDateByPriority(priority || 'medium');

  const attachments = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => attachments.push(file.filename));
  } else if (req.file) {
    attachments.push(req.file.filename);
  }

  const complaint = await Complaint.create({
    complaintId,
    title,
    description,
    category,
    priority: priority || 'medium',
    sourceChannel: sourceChannel || 'web',
    submittedBy: req.user._id,
    dueDate,
    attachments,
  });

  await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: 'Complaint created',
    toStatus: 'open',
    comment: 'Complaint submitted',
  });

  return successResponse(res, { complaint }, 'Complaint created successfully', 201);
};

const getAllComplaints = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (['member', 'trainer'].includes(req.user.role)) {
    filter.submittedBy = req.user._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ title: regex }, { complaintId: regex }];
  }

  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('submittedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return successResponse(res, {
    complaints,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email avatar phone')
    .populate('assignedTo', 'name email avatar');

  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  if (
    req.user.role === 'member' &&
    complaint.submittedBy._id.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 'Not authorized to view this complaint', 403);
  }

  const history = await ComplaintHistory.find({ complaint: complaint._id })
    .populate('changedBy', 'name email')
    .sort({ createdAt: -1 });

  return successResponse(res, { complaint, history });
};

const updateComplaintStatus = async (req, res) => {
  const { status, comment } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  const fromStatus = complaint.status;
  complaint.status = status;

  if (status === 'closed') complaint.closedAt = new Date();

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: `Status changed from ${fromStatus} to ${status}`,
    fromStatus,
    toStatus: status,
    comment,
  });

  return successResponse(res, { complaint }, 'Status updated successfully');
};

const assignComplaint = async (req, res) => {
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  const prevAssignee = complaint.assignedTo;
  complaint.assignedTo = assignedTo;

  if (complaint.status === 'open') complaint.status = 'acknowledged';

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: `Complaint assigned to user ${assignedTo}`,
    fromStatus: prevAssignee ? prevAssignee.toString() : null,
    toStatus: assignedTo,
    comment: req.body.comment,
  });

  const populated = await Complaint.findById(complaint._id)
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email');

  return successResponse(res, { complaint: populated }, 'Complaint assigned successfully');
};

const addComment = async (req, res) => {
  const { comment } = req.body;
  if (!comment) return errorResponse(res, 'Comment is required', 400);

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  if (
    req.user.role === 'member' &&
    complaint.submittedBy.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 'Not authorized to comment on this complaint', 403);
  }

  const history = await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: 'Comment added',
    comment,
  });

  const populated = await ComplaintHistory.findById(history._id).populate(
    'changedBy',
    'name email'
  );

  return successResponse(res, { history: populated }, 'Comment added successfully', 201);
};

const escalateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  const fromStatus = complaint.status;
  complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
  complaint.status = 'escalated';

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: `Complaint escalated to level ${complaint.escalationLevel}`,
    fromStatus,
    toStatus: 'escalated',
    comment: req.body.comment,
  });

  return successResponse(res, { complaint }, 'Complaint escalated successfully');
};

const resolveComplaint = async (req, res) => {
  const { resolutionNotes, correctiveAction, rootCause } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  const fromStatus = complaint.status;
  complaint.status = 'resolved';
  complaint.resolvedAt = new Date();
  if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
  if (correctiveAction) complaint.correctiveAction = correctiveAction;
  if (rootCause) complaint.rootCause = rootCause;

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    changedBy: req.user._id,
    action: 'Complaint resolved',
    fromStatus,
    toStatus: 'resolved',
    comment: resolutionNotes,
  });

  return successResponse(res, { complaint }, 'Complaint resolved successfully');
};

const getComplaintHistory = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  if (
    req.user.role === 'member' &&
    complaint.submittedBy.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 'Not authorized to view this history', 403);
  }

  const history = await ComplaintHistory.find({ complaint: complaint._id })
    .populate('changedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  return successResponse(res, { history });
};

const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  await ComplaintHistory.deleteMany({ complaint: req.params.id });

  return successResponse(res, null, 'Complaint deleted successfully');
};

module.exports = {
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
};
