import React from 'react'

const statusColors = {
  open: 'badge--blue',
  acknowledged: 'badge--yellow',
  in_progress: 'badge--orange',
  resolved: 'badge--green',
  closed: 'badge--gray',
  escalated: 'badge--red',
  rejected: 'badge--dark',
  awaiting_customer: 'badge--purple',
}

const priorityColors = {
  low: 'badge--green',
  medium: 'badge--yellow',
  high: 'badge--orange',
  urgent: 'badge--red',
}

const roleColors = {
  admin: 'badge--purple',
  manager: 'badge--blue',
  trainer: 'badge--orange',
  member: 'badge--gray',
}

const userStatusColors = {
  active: 'badge--green',
  suspended: 'badge--yellow',
  inactive: 'badge--gray',
  deactivated: 'badge--red',
}

function getColorClass(type, value) {
  if (type === 'status') return statusColors[value] || 'badge--gray'
  if (type === 'priority') return priorityColors[value] || 'badge--gray'
  if (type === 'role') return roleColors[value] || 'badge--gray'
  if (type === 'userStatus') return userStatusColors[value] || 'badge--gray'
  return 'badge--gray'
}

export default function Badge({ value, type = 'status', label }) {
  const colorClass = getColorClass(type, value)
  const displayLabel = label || (value ? value.replace(/_/g, ' ') : '—')
  return <span className={`badge ${colorClass}`}>{displayLabel}</span>
}
