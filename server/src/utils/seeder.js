require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const ActivityLog = require('../models/ActivityLog');
const { generateComplaintId } = require('./generateId');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a Date offset by `days` from now (negative = in the past). */
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

/** Return a Date offset by `days` from a given base Date. */
const daysFrom = (base, days) => new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

const seed = async () => {
  await connectDB();

  // ── 1. Clear all collections ──────────────────────────────────────────────
  console.log('\n🗑  Clearing existing data…');
  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    ComplaintHistory.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  // ── 2. Create users ───────────────────────────────────────────────────────
  console.log('👤  Creating users…');

  const PASSWORD = 'password123';

  const [admin, manager, trainer, alice, bob, carol] = await User.create([
    {
      name: 'Sarah Mitchell',
      email: 'admin@gymms.com',
      password: PASSWORD,
      role: 'admin',
      status: 'active',
      phone: '+1-555-0101',
      address: '10 Admin Plaza, Springfield, IL 62701',
      dateOfBirth: new Date('1985-03-14'),
      joinDate: new Date('2020-01-01'),
      membershipPlan: 'none',
    },
    {
      name: 'James Carter',
      email: 'manager@gymms.com',
      password: PASSWORD,
      role: 'manager',
      status: 'active',
      phone: '+1-555-0102',
      address: '22 Manager Street, Springfield, IL 62702',
      dateOfBirth: new Date('1988-07-22'),
      joinDate: new Date('2020-02-15'),
      membershipPlan: 'none',
    },
    {
      name: 'Marcus Johnson',
      email: 'trainer@gymms.com',
      password: PASSWORD,
      role: 'trainer',
      status: 'active',
      phone: '+1-555-0103',
      address: '5 Trainer Blvd, Springfield, IL 62703',
      dateOfBirth: new Date('1993-11-05'),
      joinDate: new Date('2021-06-01'),
      membershipPlan: 'none',
    },
    {
      name: 'Alice Thompson',
      email: 'alice@gymms.com',
      password: PASSWORD,
      role: 'member',
      status: 'active',
      phone: '+1-555-0201',
      address: '101 Oak Lane, Springfield, IL 62704',
      dateOfBirth: new Date('1995-08-18'),
      joinDate: new Date('2024-01-10'),
      membershipPlan: 'premium',
      membershipStart: new Date('2024-01-10'),
      membershipExpiry: daysFromNow(240),
    },
    {
      name: 'Bob Williams',
      email: 'bob@gymms.com',
      password: PASSWORD,
      role: 'member',
      status: 'active',
      phone: '+1-555-0202',
      address: '203 Maple Drive, Springfield, IL 62705',
      dateOfBirth: new Date('1990-04-30'),
      joinDate: new Date('2024-03-01'),
      membershipPlan: 'standard',
      membershipStart: new Date('2024-03-01'),
      membershipExpiry: daysFromNow(120),
    },
    {
      name: 'Carol Davis',
      email: 'carol@gymms.com',
      password: PASSWORD,
      role: 'member',
      status: 'active',
      phone: '+1-555-0203',
      address: '77 Pine Road, Springfield, IL 62706',
      dateOfBirth: new Date('1998-12-09'),
      joinDate: new Date('2024-06-15'),
      membershipPlan: 'basic',
      membershipStart: new Date('2024-06-15'),
      membershipExpiry: daysFromNow(60),
    },
  ]);

  // ── 3. Create complaints ──────────────────────────────────────────────────
  console.log('📋  Creating complaints…');

  // Complaint 1 — Equipment / high / in_progress
  // Full lifecycle so far: open → acknowledged → in_progress
  const c1CreatedAt = daysFromNow(-14);
  const c1Id = await generateComplaintId();
  const c1 = await Complaint.create({
    complaintId: c1Id,
    title: 'Treadmill in Zone A is broken',
    description:
      'The treadmill nearest the entrance in Zone A has been out of service for over two weeks. ' +
      'The belt slips badly at speeds above 6 km/h and the emergency stop cord is detached. ' +
      'Multiple members have almost fallen off. This is a safety hazard and needs urgent repair.',
    category: 'equipment',
    priority: 'high',
    status: 'in_progress',
    sourceChannel: 'web',
    submittedBy: alice._id,
    assignedTo: manager._id,
    dueDate: daysFrom(c1CreatedAt, 3),
    isOverdue: true,
    escalationLevel: 1,
    createdAt: c1CreatedAt,
    updatedAt: daysFrom(c1CreatedAt, 2),
  });

  // Complaint 2 — Billing / urgent / escalated
  // Lifecycle: open → acknowledged → escalated
  const c2CreatedAt = daysFromNow(-10);
  const c2Id = await generateComplaintId();
  const c2 = await Complaint.create({
    complaintId: c2Id,
    title: 'Double charge on October membership fee',
    description:
      'My bank statement shows two identical charges of $59.99 on 1st October for my monthly ' +
      'membership fee. I have only one active membership. I need a refund for the duplicate ' +
      'charge immediately and confirmation that this will not happen again.',
    category: 'billing',
    priority: 'urgent',
    status: 'escalated',
    sourceChannel: 'email',
    submittedBy: bob._id,
    assignedTo: admin._id,
    dueDate: daysFrom(c2CreatedAt, 3),
    isOverdue: true,
    escalationLevel: 2,
    createdAt: c2CreatedAt,
    updatedAt: daysFrom(c2CreatedAt, 4),
  });

  // Complaint 3 — Cleanliness / medium / open
  // Lifecycle: open only (freshly submitted)
  const c3CreatedAt = daysFromNow(-2);
  const c3Id = await generateComplaintId();
  const c3 = await Complaint.create({
    complaintId: c3Id,
    title: 'Locker room not cleaned for several days',
    description:
      'The women\'s locker room floor has been visibly dirty for at least three days — there are ' +
      'hair clumps near the drains and the mirrors have not been wiped. The cleaning schedule ' +
      'on the wall has not been signed off since Monday. Please have it cleaned urgently.',
    category: 'cleanliness',
    priority: 'medium',
    status: 'open',
    sourceChannel: 'web',
    submittedBy: carol._id,
    dueDate: daysFrom(c3CreatedAt, 7),
    createdAt: c3CreatedAt,
    updatedAt: c3CreatedAt,
  });

  // Complaint 4 — Trainer / medium / resolved
  // Full lifecycle: open → acknowledged → in_progress → resolved
  const c4CreatedAt = daysFromNow(-20);
  const c4ResolvedAt = daysFromNow(-6);
  const c4Id = await generateComplaintId();
  const c4 = await Complaint.create({
    complaintId: c4Id,
    title: 'Personal trainer missed scheduled session without notice',
    description:
      'My personal training session was booked for Wednesday 9 AM. My trainer, Marcus, did not ' +
      'show up and did not contact me beforehand. I waited 30 minutes before leaving. I lost ' +
      'both the session fee and my morning workout. This is not the first time this has happened.',
    category: 'trainer',
    priority: 'medium',
    status: 'resolved',
    sourceChannel: 'mobile',
    submittedBy: alice._id,
    assignedTo: manager._id,
    dueDate: daysFrom(c4CreatedAt, 7),
    resolvedAt: c4ResolvedAt,
    resolutionNotes:
      'Trainer confirmed the scheduling system showed a conflict that was not surfaced to him. ' +
      'Alice has been offered a complimentary session and the session fee has been credited back.',
    correctiveAction:
      'All trainers have been briefed on the new session-reminder protocol. Automated 1-hour ' +
      'reminder notifications will now be sent to both trainer and member.',
    rootCause: 'Scheduling software conflict not surfaced to trainer in time',
    createdAt: c4CreatedAt,
    updatedAt: c4ResolvedAt,
  });

  // Complaint 5 — Technical / low / closed
  // Full lifecycle: open → acknowledged → in_progress → resolved → closed
  const c5CreatedAt = daysFromNow(-30);
  const c5ResolvedAt = daysFromNow(-22);
  const c5ClosedAt = daysFromNow(-20);
  const c5Id = await generateComplaintId();
  const c5 = await Complaint.create({
    complaintId: c5Id,
    title: 'Unable to log in to the gym mobile app after update',
    description:
      'Since the app updated to version 3.1.0 on 5th November I have been unable to log in. ' +
      'The app shows "authentication error" immediately after entering my credentials. ' +
      'I have tried reinstalling the app twice on both Android and my wife\'s iPhone — same issue.',
    category: 'technical',
    priority: 'low',
    status: 'closed',
    sourceChannel: 'mobile',
    submittedBy: bob._id,
    assignedTo: manager._id,
    dueDate: daysFrom(c5CreatedAt, 14),
    resolvedAt: c5ResolvedAt,
    closedAt: c5ClosedAt,
    resolutionNotes:
      'A token-validation bug was introduced in v3.1.0. A patch (v3.1.1) was released and ' +
      'pushed to all stores on 13th November. Bob confirmed the issue is resolved.',
    correctiveAction:
      'Added automated end-to-end login regression test to the CI pipeline to prevent recurrence.',
    rootCause: 'Invalid JWT expiry format introduced in v3.1.0 mobile build',
    createdAt: c5CreatedAt,
    updatedAt: c5ClosedAt,
  });

  const complaints = [c1, c2, c3, c4, c5];

  // ── 4. Create complaint histories ─────────────────────────────────────────
  console.log('🕑  Creating complaint histories…');

  // --- Complaint 1 history (in_progress) ---
  await ComplaintHistory.insertMany([
    {
      complaint: c1._id,
      changedBy: alice._id,
      action: 'Complaint submitted',
      toStatus: 'open',
      comment: 'Submitted via web portal.',
      createdAt: c1CreatedAt,
    },
    {
      complaint: c1._id,
      changedBy: manager._id,
      action: 'Status changed to acknowledged',
      fromStatus: 'open',
      toStatus: 'acknowledged',
      comment: 'Received. Logging a maintenance request with the facilities team.',
      createdAt: daysFrom(c1CreatedAt, 1),
    },
    {
      complaint: c1._id,
      changedBy: manager._id,
      action: 'Status changed to in_progress',
      fromStatus: 'acknowledged',
      toStatus: 'in_progress',
      comment: 'Maintenance team has inspected the treadmill. Waiting on parts delivery.',
      createdAt: daysFrom(c1CreatedAt, 2),
    },
    {
      complaint: c1._id,
      changedBy: alice._id,
      action: 'Comment added',
      comment: 'Hi — any update on this? It has now been two weeks and the machine is still taped off.',
      createdAt: daysFromNow(-3),
    },
    {
      complaint: c1._id,
      changedBy: manager._id,
      action: 'Comment added',
      comment: 'Apologies for the delay. Parts arrived today. Engineer is scheduled for tomorrow morning.',
      createdAt: daysFromNow(-2),
    },
  ]);

  // --- Complaint 2 history (escalated) ---
  await ComplaintHistory.insertMany([
    {
      complaint: c2._id,
      changedBy: bob._id,
      action: 'Complaint submitted',
      toStatus: 'open',
      comment: 'Submitted via email channel.',
      createdAt: c2CreatedAt,
    },
    {
      complaint: c2._id,
      changedBy: admin._id,
      action: 'Status changed to acknowledged',
      fromStatus: 'open',
      toStatus: 'acknowledged',
      comment: 'Acknowledged. Forwarding to the billing department for investigation.',
      createdAt: daysFrom(c2CreatedAt, 1),
    },
    {
      complaint: c2._id,
      changedBy: admin._id,
      action: 'Complaint escalated to level 1',
      fromStatus: 'acknowledged',
      toStatus: 'escalated',
      comment: 'Billing team has not responded within SLA. Escalating.',
      createdAt: daysFrom(c2CreatedAt, 3),
    },
    {
      complaint: c2._id,
      changedBy: bob._id,
      action: 'Comment added',
      comment: 'This is still unresolved. I have now been waiting 10 days. I will contact my bank if not resolved by EOD Friday.',
      createdAt: daysFromNow(-1),
    },
    {
      complaint: c2._id,
      changedBy: null,
      action: 'Auto-escalated to level 2 (overdue)',
      fromStatus: 'escalated',
      toStatus: 'escalated',
      comment: 'Automatically escalated by the system due to overdue deadline.',
      createdAt: daysFrom(c2CreatedAt, 4),
    },
  ]);

  // --- Complaint 3 history (open, just submitted) ---
  await ComplaintHistory.insertMany([
    {
      complaint: c3._id,
      changedBy: carol._id,
      action: 'Complaint submitted',
      toStatus: 'open',
      comment: 'Submitted via web portal.',
      createdAt: c3CreatedAt,
    },
  ]);

  // --- Complaint 4 history (resolved) ---
  await ComplaintHistory.insertMany([
    {
      complaint: c4._id,
      changedBy: alice._id,
      action: 'Complaint submitted',
      toStatus: 'open',
      comment: 'Submitted via mobile app.',
      createdAt: c4CreatedAt,
    },
    {
      complaint: c4._id,
      changedBy: manager._id,
      action: 'Status changed to acknowledged',
      fromStatus: 'open',
      toStatus: 'acknowledged',
      comment: 'Acknowledged. Speaking with Marcus to get his account of the session.',
      createdAt: daysFrom(c4CreatedAt, 1),
    },
    {
      complaint: c4._id,
      changedBy: manager._id,
      action: 'Complaint assigned',
      comment: 'Assigned to James Carter for resolution.',
      createdAt: daysFrom(c4CreatedAt, 1),
    },
    {
      complaint: c4._id,
      changedBy: manager._id,
      action: 'Status changed to in_progress',
      fromStatus: 'acknowledged',
      toStatus: 'in_progress',
      comment: 'Investigation underway. Reviewing trainer scheduling logs.',
      createdAt: daysFrom(c4CreatedAt, 3),
    },
    {
      complaint: c4._id,
      changedBy: alice._id,
      action: 'Comment added',
      comment: 'Thank you for looking into this. To clarify — this is the second time in a month.',
      createdAt: daysFrom(c4CreatedAt, 4),
    },
    {
      complaint: c4._id,
      changedBy: manager._id,
      action: 'Complaint resolved',
      fromStatus: 'in_progress',
      toStatus: 'resolved',
      comment:
        'Root cause confirmed as a scheduling system bug. Complimentary session and fee credit issued to Alice. Trainer warned formally.',
      createdAt: c4ResolvedAt,
    },
  ]);

  // --- Complaint 5 history (closed, full lifecycle) ---
  await ComplaintHistory.insertMany([
    {
      complaint: c5._id,
      changedBy: bob._id,
      action: 'Complaint submitted',
      toStatus: 'open',
      comment: 'Submitted via mobile app.',
      createdAt: c5CreatedAt,
    },
    {
      complaint: c5._id,
      changedBy: manager._id,
      action: 'Status changed to acknowledged',
      fromStatus: 'open',
      toStatus: 'acknowledged',
      comment: 'Acknowledged. Routing to the technical team for investigation.',
      createdAt: daysFrom(c5CreatedAt, 1),
    },
    {
      complaint: c5._id,
      changedBy: manager._id,
      action: 'Status changed to in_progress',
      fromStatus: 'acknowledged',
      toStatus: 'in_progress',
      comment: 'Technical team has reproduced the bug on Android 14. iOS confirmed affected too.',
      createdAt: daysFrom(c5CreatedAt, 3),
    },
    {
      complaint: c5._id,
      changedBy: manager._id,
      action: 'Status changed to awaiting_customer',
      fromStatus: 'in_progress',
      toStatus: 'awaiting_customer',
      comment: 'Patch v3.1.1 released to stores. Asking Bob to confirm the fix.',
      createdAt: daysFrom(c5CreatedAt, 7),
    },
    {
      complaint: c5._id,
      changedBy: bob._id,
      action: 'Comment added',
      comment: 'Updated the app — can confirm the login is working again. Thank you!',
      createdAt: c5ResolvedAt,
    },
    {
      complaint: c5._id,
      changedBy: manager._id,
      action: 'Complaint resolved',
      fromStatus: 'awaiting_customer',
      toStatus: 'resolved',
      comment: 'Customer confirmed fix. Marking as resolved.',
      createdAt: c5ResolvedAt,
    },
    {
      complaint: c5._id,
      changedBy: manager._id,
      action: 'Complaint closed',
      fromStatus: 'resolved',
      toStatus: 'closed',
      comment: 'No further action required. Closing.',
      createdAt: c5ClosedAt,
    },
  ]);

  // Fix null changedBy on auto-escalate entry (uses system placeholder — just skip populate)
  await ComplaintHistory.updateMany(
    { changedBy: null },
    { $set: { changedBy: admin._id } }
  );

  // ── 5. Create activity logs ───────────────────────────────────────────────
  console.log('📝  Creating activity logs…');

  await ActivityLog.insertMany([
    // Registrations
    { userId: admin._id,   action: 'User registered',  details: 'Admin account created',             ipAddress: '127.0.0.1', createdAt: new Date('2020-01-01') },
    { userId: manager._id, action: 'User registered',  details: 'Manager account created',           ipAddress: '127.0.0.1', createdAt: new Date('2020-02-15') },
    { userId: trainer._id, action: 'User registered',  details: 'Trainer account created',           ipAddress: '127.0.0.1', createdAt: new Date('2021-06-01') },
    { userId: alice._id,   action: 'User registered',  details: 'Member self-registered via portal', ipAddress: '203.0.113.5', createdAt: new Date('2024-01-10') },
    { userId: bob._id,     action: 'User registered',  details: 'Member self-registered via portal', ipAddress: '203.0.113.8', createdAt: new Date('2024-03-01') },
    { userId: carol._id,   action: 'User registered',  details: 'Member self-registered via portal', ipAddress: '203.0.113.11', createdAt: new Date('2024-06-15') },

    // Account activations
    { userId: admin._id,   action: 'User activated', targetUserId: alice._id,   details: 'Account activated after payment verification', ipAddress: '127.0.0.1', createdAt: new Date('2024-01-10') },
    { userId: admin._id,   action: 'User activated', targetUserId: bob._id,     details: 'Account activated after payment verification', ipAddress: '127.0.0.1', createdAt: new Date('2024-03-01') },
    { userId: admin._id,   action: 'User activated', targetUserId: carol._id,   details: 'Account activated after payment verification', ipAddress: '127.0.0.1', createdAt: new Date('2024-06-15') },

    // Logins
    { userId: alice._id,   action: 'User logged in',   details: 'Successful login from Chrome/Windows',  ipAddress: '203.0.113.5',  createdAt: daysFromNow(-5)  },
    { userId: bob._id,     action: 'User logged in',   details: 'Successful login from Safari/iPhone',   ipAddress: '203.0.113.8',  createdAt: daysFromNow(-3)  },
    { userId: carol._id,   action: 'User logged in',   details: 'Successful login from Firefox/Mac',     ipAddress: '203.0.113.11', createdAt: daysFromNow(-2)  },
    { userId: manager._id, action: 'User logged in',   details: 'Successful login from Chrome/Windows',  ipAddress: '10.0.0.2',     createdAt: daysFromNow(-1)  },
    { userId: admin._id,   action: 'User logged in',   details: 'Successful login from Chrome/Windows',  ipAddress: '10.0.0.1',     createdAt: daysFromNow(-1)  },
    { userId: trainer._id, action: 'User logged in',   details: 'Successful login from mobile app',      ipAddress: '203.0.113.15', createdAt: daysFromNow(-4)  },

    // Profile updates
    { userId: alice._id,   action: 'Profile updated',  details: 'Updated phone number and address',   ipAddress: '203.0.113.5', createdAt: daysFromNow(-10) },
    { userId: bob._id,     action: 'Profile updated',  details: 'Updated profile photo',              ipAddress: '203.0.113.8', createdAt: daysFromNow(-7)  },

    // Password changes
    { userId: alice._id,   action: 'Password changed', details: 'Password updated by user',           ipAddress: '203.0.113.5', createdAt: daysFromNow(-15) },

    // Complaint management
    { userId: manager._id, action: 'Complaint assigned',    details: `Complaint ${c1Id} assigned to James Carter`,  ipAddress: '10.0.0.2', createdAt: daysFrom(c1CreatedAt, 2) },
    { userId: manager._id, action: 'Complaint assigned',    details: `Complaint ${c4Id} assigned to James Carter`,  ipAddress: '10.0.0.2', createdAt: daysFrom(c4CreatedAt, 1) },
    { userId: admin._id,   action: 'Complaint escalated',   details: `Complaint ${c2Id} escalated to level 1`,       ipAddress: '10.0.0.1', createdAt: daysFrom(c2CreatedAt, 3) },
    { userId: manager._id, action: 'Complaint resolved',    details: `Complaint ${c4Id} resolved — corrective action issued`, ipAddress: '10.0.0.2', createdAt: c4ResolvedAt },
    { userId: manager._id, action: 'Complaint closed',      details: `Complaint ${c5Id} closed after customer confirmation`, ipAddress: '10.0.0.2', createdAt: c5ClosedAt   },
  ]);

  // ── 6. Done ───────────────────────────────────────────────────────────────
  console.log('\n✅  Seed completed successfully!\n');
  console.log('━'.repeat(52));
  console.log('  ROLE      │ EMAIL                  │ PASSWORD');
  console.log('━'.repeat(52));
  console.log('  Admin     │ admin@gymms.com         │ password123');
  console.log('  Manager   │ manager@gymms.com       │ password123');
  console.log('  Trainer   │ trainer@gymms.com       │ password123');
  console.log('  Member    │ alice@gymms.com         │ password123');
  console.log('  Member    │ bob@gymms.com           │ password123');
  console.log('  Member    │ carol@gymms.com         │ password123');
  console.log('━'.repeat(52));
  console.log(`\n  Complaints seeded: ${complaints.length}`);
  console.log(`    ${c1Id}  Broken treadmill                [in_progress / high]`);
  console.log(`    ${c2Id}  Billing double charge           [escalated  / urgent]`);
  console.log(`    ${c3Id}  Locker room cleanliness          [open       / medium]`);
  console.log(`    ${c4Id}  Trainer missed session          [resolved   / medium]`);
  console.log(`    ${c5Id}  Mobile app login issue          [closed     / low]`);
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
