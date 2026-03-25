require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const ActivityLog = require('../models/ActivityLog');
const { generateComplaintId } = require('./generateId');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    ComplaintHistory.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  console.log('Creating users...');
  const password = 'password123';

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@gym.com',
      password,
      role: 'admin',
      status: 'active',
      phone: '555-0001',
      address: '1 Admin Ave',
    },
    {
      name: 'Manager User',
      email: 'manager@gym.com',
      password,
      role: 'manager',
      status: 'active',
      phone: '555-0002',
      address: '2 Manager St',
    },
    {
      name: 'Trainer User',
      email: 'trainer@gym.com',
      password,
      role: 'trainer',
      status: 'active',
      phone: '555-0003',
      address: '3 Trainer Blvd',
    },
    {
      name: 'Alice Member',
      email: 'alice@gym.com',
      password,
      role: 'member',
      status: 'active',
      phone: '555-0004',
      address: '4 Member Lane',
      membershipPlan: 'premium',
      membershipStart: new Date('2024-01-01'),
      membershipExpiry: new Date('2024-12-31'),
    },
    {
      name: 'Bob Member',
      email: 'bob@gym.com',
      password,
      role: 'member',
      status: 'active',
      phone: '555-0005',
      address: '5 Member Lane',
      membershipPlan: 'standard',
      membershipStart: new Date('2024-03-01'),
      membershipExpiry: new Date('2025-02-28'),
    },
    {
      name: 'Carol Member',
      email: 'carol@gym.com',
      password,
      role: 'member',
      status: 'active',
      phone: '555-0006',
      address: '6 Member Lane',
      membershipPlan: 'basic',
      membershipStart: new Date('2024-06-01'),
      membershipExpiry: new Date('2025-05-31'),
    },
  ]);

  const [admin, manager, trainer, alice, bob, carol] = users;

  console.log('Creating complaints...');

  const complaintData = [
    {
      title: 'Broken treadmill in zone A',
      description: 'The treadmill in zone A has been broken for two weeks with no repair.',
      category: 'equipment',
      priority: 'high',
      submittedBy: alice._id,
      assignedTo: manager._id,
      status: 'in_progress',
      sourceChannel: 'web',
    },
    {
      title: 'Billing overcharge on monthly fee',
      description: 'I was charged twice for the monthly membership fee in October.',
      category: 'billing',
      priority: 'urgent',
      submittedBy: bob._id,
      assignedTo: admin._id,
      status: 'acknowledged',
      sourceChannel: 'email',
    },
    {
      title: 'Locker room cleanliness issue',
      description: 'The locker room has not been cleaned properly for several days.',
      category: 'cleanliness',
      priority: 'medium',
      submittedBy: carol._id,
      status: 'open',
      sourceChannel: 'web',
    },
    {
      title: 'Trainer skipped our session',
      description: 'My assigned trainer did not show up for our scheduled session without notice.',
      category: 'trainer',
      priority: 'medium',
      submittedBy: alice._id,
      status: 'resolved',
      resolvedAt: new Date(),
      resolutionNotes: 'Trainer was contacted and session rescheduled. Apology issued.',
      correctiveAction: 'Trainer received a formal warning.',
      rootCause: 'Scheduling conflict not communicated in time',
      sourceChannel: 'mobile',
    },
    {
      title: 'App login not working',
      description: 'I cannot log into the gym mobile app since the latest update.',
      category: 'technical',
      priority: 'low',
      submittedBy: bob._id,
      status: 'closed',
      resolvedAt: new Date(),
      closedAt: new Date(),
      resolutionNotes: 'App update patched; user confirmed issue resolved.',
      rootCause: 'Bug introduced in v2.3.1 update',
      sourceChannel: 'mobile',
    },
  ];

  const complaints = [];
  for (const data of complaintData) {
    const complaintId = await generateComplaintId();
    const daysMap = { urgent: 3, high: 3, medium: 7, low: 14 };
    const days = daysMap[data.priority] || 7;
    const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const complaint = await Complaint.create({ ...data, complaintId, dueDate });
    complaints.push(complaint);
  }

  console.log('Creating complaint histories...');

  const historyEntries = complaints.map((c) => ({
    complaint: c._id,
    changedBy: c.submittedBy,
    action: 'Complaint created',
    toStatus: c.status,
    comment: 'Initial submission',
  }));

  // Additional status-change history for some complaints
  historyEntries.push({
    complaint: complaints[0]._id,
    changedBy: manager._id,
    action: 'Status changed from open to in_progress',
    fromStatus: 'open',
    toStatus: 'in_progress',
    comment: 'Assigned to maintenance team',
  });

  historyEntries.push({
    complaint: complaints[3]._id,
    changedBy: admin._id,
    action: 'Complaint resolved',
    fromStatus: 'in_progress',
    toStatus: 'resolved',
    comment: 'Session rescheduled and apology issued',
  });

  await ComplaintHistory.insertMany(historyEntries);

  console.log('Creating activity logs...');

  await ActivityLog.insertMany([
    {
      userId: admin._id,
      action: 'User activated',
      targetUserId: alice._id,
      details: 'Alice Member account activated',
      ipAddress: '127.0.0.1',
    },
    {
      userId: manager._id,
      action: 'Complaint assigned',
      details: `Assigned complaint ${complaints[0].complaintId}`,
      ipAddress: '127.0.0.1',
    },
    {
      userId: alice._id,
      action: 'User logged in',
      details: 'Successful login',
      ipAddress: '127.0.0.1',
    },
    {
      userId: bob._id,
      action: 'User logged in',
      details: 'Successful login',
      ipAddress: '127.0.0.1',
    },
  ]);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('--- Seed Credentials ---');
  console.log('Admin:   admin@gym.com   / password123');
  console.log('Manager: manager@gym.com / password123');
  console.log('Trainer: trainer@gym.com / password123');
  console.log('Member:  alice@gym.com   / password123');
  console.log('Member:  bob@gym.com     / password123');
  console.log('Member:  carol@gym.com   / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
