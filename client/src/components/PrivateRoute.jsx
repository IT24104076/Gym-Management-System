import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
