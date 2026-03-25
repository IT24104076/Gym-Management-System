import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/api.js'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      const res = await authService.login(form)
      const { token, user } = res.data
      login(user, token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span className="auth-logo-icon">🏋️</span>
        <h1 className="auth-title">GymMS</h1>
        <p className="auth-subtitle">Gym Management System</p>
      </div>

      <h2 className="auth-heading">Sign In</h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            className="form-control"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            className="form-control"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer-text">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link">Register here</Link>
      </p>
    </div>
  )
}
