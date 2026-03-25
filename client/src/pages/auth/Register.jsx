import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/api.js'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'member',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      await authService.register(payload)
      setSuccess('Registration successful! Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card auth-card--wide">
      <div className="auth-logo">
        <span className="auth-logo-icon">🏋️</span>
        <h1 className="auth-title">GymMS</h1>
        <p className="auth-subtitle">Gym Management System</p>
      </div>

      <h2 className="auth-heading">Create Account</h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              className="form-control"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              className="form-control"
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <input
            className="form-control"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
            <input
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role">Role</label>
          <select
            className="form-control"
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="member">Member</option>
          </select>
          <small className="form-hint">Members can self-register. Admin/Manager/Trainer accounts are created by administrators.</small>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </div>
  )
}
