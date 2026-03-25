import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import UserManagement from './pages/users/UserManagement.jsx'
import UserDetail from './pages/users/UserDetail.jsx'
import Profile from './pages/Profile.jsx'
import ComplaintsList from './pages/complaints/ComplaintsList.jsx'
import NewComplaint from './pages/complaints/NewComplaint.jsx'
import ComplaintDetail from './pages/complaints/ComplaintDetail.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes inside dashboard layout */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complaints" element={<ComplaintsList />} />
            <Route path="/complaints/new" element={<NewComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintDetail />} />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={['admin', 'manager']}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <PrivateRoute roles={['admin', 'manager']}>
                  <UserDetail />
                </PrivateRoute>
              }
            />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
