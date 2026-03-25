import React from 'react'

export default function StatCard({ icon, title, value, color = 'primary', subtitle }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value ?? '—'}</span>
        <span className="stat-card-title">{title}</span>
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
