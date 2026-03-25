import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authService } from '../services/api.js'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/users': 'User Management',
  '/complaints': 'Complaints',
  '/complaints/new': 'New Complaint',
}

function getTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.startsWith('/complaints/')) return 'Complaint Detail'
  if (pathname.startsWith('/users/')) return 'User Detail'
  return 'Gym Management'
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore errors on logout
    }
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          ☰
        </button>
        <h1 className="topbar-title">{getTitle(location.pathname)}</h1>
      </div>
      <div className="topbar-right" ref={dropdownRef}>
        <button
          className="topbar-avatar-btn"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="User menu"
        >
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-user-name">{user?.name}</span>
          <span className="topbar-chevron">{dropdownOpen ? '▲' : '▼'}</span>
        </button>
        {dropdownOpen && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-header">
              <span className="topbar-dropdown-name">{user?.name}</span>
              <span className="topbar-dropdown-email">{user?.email}</span>
            </div>
            <button
              className="topbar-dropdown-item"
              onClick={() => { setDropdownOpen(false); navigate('/profile') }}
            >
              👤 My Profile
            </button>
            <button
              className="topbar-dropdown-item topbar-dropdown-item--danger"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
