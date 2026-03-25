import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userService } from '../../services/api.js'
import Badge from '../../components/Badge.jsx'
import Table from '../../components/Table.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const [userRes, actRes] = await Promise.all([
          userService.getUserById(id),
          userService.getUserActivity(id),
        ])
        setUser(userRes.data?.data || userRes.data)
        const actData = actRes.data?.data || actRes.data
        setActivity(Array.isArray(actData) ? actData : actData?.activities || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details.')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleStatusChange = async (action) => {
    setActionLoading(true)
    try {
      if (action === 'activate') await userService.activateUser(id)
      else if (action === 'suspend') await userService.suspendUser(id)
      else if (action === 'deactivate') await userService.deactivateUser(id)
      setSuccess(`User ${action}d successfully.`)
      const res = await userService.getUserById(id)
      setUser(res.data?.data || res.data)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user.`)
    } finally {
      setActionLoading(false)
    }
  }

  const activityColumns = [
    { key: 'action', label: 'Action' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val) },
  ]

  if (loading) return <LoadingSpinner center />

  if (!user) {
    return (
      <div className="page">
        <Alert type="error" message={error || 'User not found.'} />
        <button className="btn btn-secondary" onClick={() => navigate('/users')}>
          ← Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">User Detail</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/users')}>
          ← Back
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="detail-grid">
        <div className="card">
          <div className="card-header"><h3>Profile</h3></div>
          <div className="card-body">
            <div className="profile-top">
              <div className="profile-avatar profile-avatar--lg">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="avatar-img" />
                  : <span>{getInitials(user.name)}</span>
                }
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
                <div className="profile-badges">
                  <Badge value={user.role} type="role" />
                  <Badge value={user.status} type="userStatus" />
                </div>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{user.phone || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{formatDate(user.dateOfBirth)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{user.address || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Joined</span>
                <span className="info-value">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Actions</h3></div>
          <div className="card-body">
            <div className="action-buttons">
              {user.status !== 'active' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange('activate')}
                  disabled={actionLoading}
                >
                  ✅ Activate User
                </button>
              )}
              {user.status === 'active' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStatusChange('suspend')}
                  disabled={actionLoading}
                >
                  ⏸ Suspend User
                </button>
              )}
              {user.status !== 'deactivated' && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleStatusChange('deactivate')}
                  disabled={actionLoading}
                >
                  🚫 Deactivate User
                </button>
              )}
              {actionLoading && <LoadingSpinner size="sm" />}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h3>Activity Log</h3></div>
        <div className="card-body">
          <Table
            columns={activityColumns}
            data={activity}
            loading={false}
            emptyMessage="No activity recorded."
          />
        </div>
      </div>
    </div>
  )
}
