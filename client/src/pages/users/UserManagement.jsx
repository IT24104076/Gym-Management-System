import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../services/api.js'
import Table from '../../components/Table.jsx'
import Badge from '../../components/Badge.jsx'
import Pagination from '../../components/Pagination.jsx'
import Modal from '../../components/Modal.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export default function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionModal, setActionModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userService.getAllUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      const data = res.data?.data || res.data
      setUsers(Array.isArray(data) ? data : data?.users || [])
      const meta = res.data?.pagination || res.data?.meta
      setTotalPages(meta?.totalPages || Math.ceil((res.data?.total || 0) / 10) || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAction = async () => {
    if (!actionModal) return
    setActionLoading(true)
    try {
      const { type, userId } = actionModal
      if (type === 'activate') await userService.activateUser(userId)
      else if (type === 'suspend') await userService.suspendUser(userId)
      else if (type === 'deactivate') await userService.deactivateUser(userId)
      setSuccess(`User ${type}d successfully.`)
      setActionModal(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <Badge value={val} type="role" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge value={val} type="userStatus" />,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="table-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => navigate(`/users/${row._id}`)}
          >
            View
          </button>
          {row.status !== 'active' && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => setActionModal({ type: 'activate', userId: row._id, userName: row.name })}
            >
              Activate
            </button>
          )}
          {row.status === 'active' && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setActionModal({ type: 'suspend', userId: row._id, userName: row.name })}
            >
              Suspend
            </button>
          )}
          {row.status !== 'deactivated' && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => setActionModal({ type: 'deactivate', userId: row._id, userName: row.name })}
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="card">
        <div className="card-body">
          <div className="filters-row">
            <input
              className="form-control"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="trainer">Trainer</option>
              <option value="member">Member</option>
            </select>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
          <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {actionModal && (
        <Modal
          title={`Confirm: ${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User`}
          onClose={() => setActionModal(null)}
        >
          <p>
            Are you sure you want to <strong>{actionModal.type}</strong> user{' '}
            <strong>{actionModal.userName}</strong>?
          </p>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setActionModal(null)}>
              Cancel
            </button>
            <button
              className={`btn btn-${actionModal.type === 'activate' ? 'success' : 'danger'}`}
              onClick={handleAction}
              disabled={actionLoading}
            >
              {actionLoading ? <LoadingSpinner size="sm" /> : `Confirm ${actionModal.type}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
