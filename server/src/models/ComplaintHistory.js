const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
    },
    fromStatus: {
      type: String,
    },
    toStatus: {
      type: String,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
