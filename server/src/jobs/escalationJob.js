const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');

const runEscalationJob = async () => {
  console.log('[EscalationJob] Running overdue complaint check...');

  const now = new Date();
  const terminalStatuses = ['resolved', 'closed', 'rejected'];

  const overdueComplaints = await Complaint.find({
    dueDate: { $lt: now },
    status: { $nin: terminalStatuses },
  });

  if (overdueComplaints.length === 0) {
    console.log('[EscalationJob] No overdue complaints found.');
    return;
  }

  for (const complaint of overdueComplaints) {
    complaint.isOverdue = true;

    if (complaint.escalationLevel < 3) {
      const fromStatus = complaint.status;
      complaint.escalationLevel += 1;
      complaint.status = 'escalated';

      await complaint.save();

      await ComplaintHistory.create({
        complaint: complaint._id,
        changedBy: complaint.submittedBy,
        action: `Auto-escalated to level ${complaint.escalationLevel} (overdue)`,
        fromStatus,
        toStatus: 'escalated',
        comment: 'Automatically escalated by the system due to overdue deadline.',
      });

      console.log(`[EscalationJob] Escalated complaint ${complaint.complaintId} to level ${complaint.escalationLevel}`);
    } else {
      await complaint.save();
      console.log(`[EscalationJob] Complaint ${complaint.complaintId} is overdue but already at max escalation level.`);
    }
  }

  console.log(`[EscalationJob] Processed ${overdueComplaints.length} overdue complaint(s).`);
};

const startEscalationJob = () => {
  // Runs every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await runEscalationJob();
    } catch (error) {
      console.error('[EscalationJob] Error during escalation job:', error.message);
    }
  });

  console.log('[EscalationJob] Escalation job scheduled (daily at midnight).');
};

module.exports = { startEscalationJob, runEscalationJob };
