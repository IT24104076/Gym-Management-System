const Complaint = require('../models/Complaint');

const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const padded = String(count + 1).padStart(3, '0');
  return `COMP-${padded}`;
};

module.exports = { generateComplaintId };
