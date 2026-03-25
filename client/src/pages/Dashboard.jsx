import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { dashboardService, complaintService } from '../services/api.js'
import StatCard from '../components/StatCard.jsx'
import Badge from '../components/Badge.jsx'
import Table from '../components/Table.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Alert from '../components/Alert.jsx'
import '../styles/dashboard.css'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [myComplaints, setMyComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (isAdminOrManager) {
          const [statsRes, activityRes] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getRecentActivity(),
          ])
          setStats(statsRes.data?.data || statsRes.data)
          setActivity(activityRes.data?.data || activityRes.data || [])
        } else {
          const res = await complaintService.getMyComplaints({ limit: 5, page: 1 })
          const data = res.data?.data || res.data
          setMyComplaints(Array.isArray(data) ? data : data?.complaints || [])
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAdminOrManager])

  const myComplaintColumns = [
    { key: 'complaintId', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (val) => <Badge value={val} type="status" /> },
    { key: 'priority', label: 'Priority', render: (val) => <Badge value={val} type="priority" /> },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => formatDate(val),
    },
  ]

  if (loading) return <LoadingSpinner center />

  return (
    <div className="dashboard-page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {isAdminOrManager ? (
        <>
          <div className="stats-grid">
            <StatCard icon="👥" title="Total Users" value={stats?.totalUsers ?? 0} color="primary" />
            <StatCard icon="📋" title="Total Complaints" value={stats?.totalComplaints ?? 0} color="info" />
            <StatCard icon="🔓" title="Open Complaints" value={stats?.openComplaints ?? 0} color="warning" />
            <StatCard icon="⏰" title="Overdue" value={stats?.overdueComplaints ?? 0} color="danger" />
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h3>Complaints by Status</h3>
              </div>
              <div className="card-body">
                {stats?.complaintsByStatus?.length > 0 ? (
                  <div className="status-breakdown">
                    {stats.complaintsByStatus.map((s) => (
                      <div key={s._id || s.status} className="status-breakdown-item">
                        <Badge value={s._id || s.status} type="status" />
                        <span className="status-breakdown-count">{s.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No data available.</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Complaints by Category</h3>
              </div>
              <div className="card-body">
                {stats?.complaintsByCategory?.length > 0 ? (
                  <div className="category-breakdown">
                    {stats.complaintsByCategory.map((c) => (
                      <div key={c._id || c.category} className="category-breakdown-item">
                        <span className="category-name">{c._id || c.category || 'Unknown'}</span>
                        <span className="category-count">{c.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No data available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="card-body">
              {activity.length === 0 ? (
                <p className="empty-text">No recent activity.</p>
              ) : (
                <div className="activity-feed">
                  {activity.slice(0, 10).map((item, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-dot" />
                      <div className="activity-content">
                        <span className="activity-text">{item.description || item.action || JSON.stringify(item)}</span>
                        <span className="activity-time">{formatDate(item.createdAt || item.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="stats-grid stats-grid--small">
            <StatCard icon="📋" title="My Complaints" value={myComplaints.length} color="info" />
            <StatCard
              icon="🔓"
              title="Open"
              value={myComplaints.filter((c) => ['open', 'in_progress', 'acknowledged'].includes(c.status)).length}
              color="warning"
            />
            <StatCard
              icon="✅"
              title="Resolved"
              value={myComplaints.filter((c) => c.status === 'resolved').length}
              color="success"
            />
          </div>

          <div className="page-header">
            <h2 className="page-title">My Recent Complaints</h2>
            <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
              ➕ New Complaint
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <Table
                columns={myComplaintColumns}
                data={myComplaints}
                loading={false}
                emptyMessage="You haven't submitted any complaints yet."
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
