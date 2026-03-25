const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TRAINER: 'trainer',
  MEMBER: 'member',
};

const COMPLAINT_STATUS = {
  OPEN: 'open',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  AWAITING_CUSTOMER: 'awaiting_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
  REJECTED: 'rejected',
};

const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const COMPLAINT_CATEGORY = {
  MEMBERSHIP: 'membership',
  BILLING: 'billing',
  TRAINER: 'trainer',
  FACILITY: 'facility',
  EQUIPMENT: 'equipment',
  CLEANLINESS: 'cleanliness',
  TECHNICAL: 'technical',
  OTHER: 'other',
};

const SOURCE_CHANNEL = {
  WEB: 'web',
  MOBILE: 'mobile',
  EMAIL: 'email',
  ADMIN: 'admin',
};

module.exports = {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  COMPLAINT_CATEGORY,
  SOURCE_CHANNEL,
};
