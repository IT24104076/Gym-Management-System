import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navLinks = {
  all: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'My Profile', icon: '👤' },
  ],
  adminManager: [
    { to: '/users', label: 'User Management', icon: '👥' },
    { to: '/complaints', label: 'All Complaints', icon: '📋' },
  ],
  member: [
    { to: '/complaints/new', label: 'Submit Complaint', icon: '➕' },
    { to: '/complaints', label: 'My Complaints', icon: '📋' },
  ],
  trainer: [
    { to: '/complaints/new', label: 'Submit Complaint', icon: '➕' },
    { to: '/complaints', label: 'Complaints', icon: '📋' },
  ],
}

function getRoleLabel(role) {
  const map = { admin: 'Administrator', manager: 'Manager', trainer: 'Trainer', member: 'Member' }
  return map[role] || role
}

function getLinks(role) {
  const links = [...navLinks.all]
  if (role === 'admin' || role === 'manager') {
    links.push(...navLinks.adminManager)
  } else if (role === 'trainer') {
    links.push(...navLinks.trainer)
  } else {
    links.push(...navLinks.member)
  }
  return links
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const links = getLinks(user?.role)
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🏋️</span>
        <span className="sidebar-logo-text">GymMS</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
            onClick={onClose}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'Unknown'}</span>
            <span className="sidebar-role-badge">{getRoleLabel(user?.role)}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
