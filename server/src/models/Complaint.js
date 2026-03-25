const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['membership', 'billing', 'trainer', 'facility', 'equipment', 'cleanliness', 'technical', 'other'],
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'awaiting_customer', 'resolved', 'closed', 'escalated', 'rejected'],
      default: 'open',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitted by is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
    sourceChannel: {
      type: String,
      enum: ['web', 'mobile', 'email', 'admin'],
      default: 'web',
    },
    attachments: [
      {
        type: String,
      },
    ],
    correctiveAction: {
      type: String,
      trim: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    rootCause: {
      type: String,
      trim: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
