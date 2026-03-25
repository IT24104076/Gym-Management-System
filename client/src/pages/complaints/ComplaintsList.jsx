import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { complaintService } from '../../services/api.js'
import Table from '../../components/Table.jsx'
import Badge from '../../components/Badge.jsx'
import Pagination from '../../components/Pagination.jsx'
import Alert from '../../components/Alert.jsx'
import '../../styles/complaints.css'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

const CATEGORIES = [
  'equipment', 'cleanliness', 'staff', 'billing', 'safety', 'scheduling', 'facilities', 'other',
]

export default function ComplaintsList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      }
      const res = isAdminOrManager
        ? await complaintService.getAllComplaints(params)
        : await complaintService.getMyComplaints(params)
      const data = res.data?.data || res.data
      setComplaints(Array.isArray(data) ? data : data?.complaints || [])
      const meta = res.data?.pagination || res.data?.meta
      setTotalPages(meta?.totalPages || Math.ceil((res.data?.total || 0) / 10) || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter, priorityFilter, isAdminOrManager])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  const columns = [
    { key: 'complaintId', label: 'ID' },
    {
      key: 'title',
      label: 'Title',
      render: (val, row) => (
        <button
          className="link-btn"
          onClick={() => navigate(`/complaints/${row._id}`)}
        >
          {val}
        </button>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => <Badge value={val} type="priority" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge value={val} type="status" />,
    },
    ...(isAdminOrManager
      ? [{ key: 'submittedBy', label: 'Submitted By', render: (val) => val?.name || val || '—' }]
      : []),
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (val) => val?.name || val || 'Unassigned',
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'view',
      label: '',
      render: (_, row) => (
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => navigate(`/complaints/${row._id}`)}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">
          {isAdminOrManager ? 'All Complaints' : 'My Complaints'}
        </h2>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
          ➕ New Complaint
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card">
        <div className="card-body">
          <div className="filters-row">
            <input
              className="form-control"
              type="text"
              placeholder="Search complaints…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <select
              className="form-control"
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <Table
            columns={columns}
            data={complaints}
            loading={loading}
            emptyMessage="No complaints found."
          />
          <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
