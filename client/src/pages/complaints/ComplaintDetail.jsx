import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { complaintService, userService } from '../../services/api.js'
import Badge from '../../components/Badge.jsx'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Modal from '../../components/Modal.jsx'
import '../../styles/complaints.css'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString()
}

function formatShortDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newStatus, setNewStatus] = useState('')
  const [assignTo, setAssignTo] = useState('')
  const [comment, setComment] = useState('')
  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: '', correctiveAction: '', rootCause: '',
  })
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchComplaint = async () => {
    try {
      const [cRes, hRes] = await Promise.all([
        complaintService.getComplaintById(id),
        complaintService.getHistory(id),
      ])
      const c = cRes.data?.data || cRes.data
      setComplaint(c)
      setNewStatus(c.status)
      const hData = hRes.data?.data || hRes.data
      setHistory(Array.isArray(hData) ? hData : hData?.history || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint.')
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchComplaint()
      if (isAdminOrManager) {
        try {
          const res = await userService.getAllUsers({ role: 'trainer,manager', status: 'active', limit: 100 })
          const data = res.data?.data || res.data
          setStaffList(Array.isArray(data) ? data : data?.users || [])
        } catch {
          // staff list is optional
        }
      }
      setLoading(false)
    }
    init()
  }, [id, isAdminOrManager])

  const doAction = async (fn) => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await fn()
      await fetchComplaint()
      setSuccess('Action completed successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = () =>
    doAction(() => complaintService.updateStatus(id, { status: newStatus }))

  const handleAssign = () =>
    doAction(() => complaintService.assignComplaint(id, { assignedTo: assignTo }))

  const handleComment = () => {
    if (!comment.trim()) { setError('Comment cannot be empty.'); return }
    doAction(async () => {
      await complaintService.addComment(id, { comment })
      setComment('')
    })
  }

  const handleEscalate = () =>
    doAction(() => complaintService.escalate(id, { reason: 'Escalated by manager' }))

  const handleResolve = () => {
    if (!resolveForm.resolutionNotes.trim()) { setError('Resolution notes are required.'); return }
    doAction(async () => {
      await complaintService.resolve(id, resolveForm)
      setShowResolveModal(false)
    })
  }

  if (loading) return <LoadingSpinner center />

  if (!complaint) {
    return (
      <div className="page">
        <Alert type="error" message={error || 'Complaint not found.'} />
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="page complaint-detail-page">
      <div className="page-header">
        <h2 className="page-title">Complaint Detail</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          ← Back
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Header card */}
      <div className="card complaint-header-card">
        <div className="card-body">
          <div className="complaint-header-row">
            <div>
              <span className="complaint-id">#{complaint.complaintId}</span>
              <h2 className="complaint-title">{complaint.title}</h2>
            </div>
            <div className="complaint-badges">
              <Badge value={complaint.status} type="status" />
              <Badge value={complaint.priority} type="priority" />
            </div>
          </div>
        </div>
      </div>

      <div className="complaint-layout">
        {/* Left column */}
        <div className="complaint-main">
          {/* Info grid */}
          <div className="card">
            <div className="card-header"><h3>Details</h3></div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{complaint.category || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Submitted By</span>
                  <span className="info-value">{complaint.submittedBy?.name || complaint.submittedBy || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Assigned To</span>
                  <span className="info-value">{complaint.assignedTo?.name || complaint.assignedTo || 'Unassigned'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Due Date</span>
                  <span className="info-value">{formatShortDate(complaint.dueDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Escalation Level</span>
                  <span className="info-value">{complaint.escalationLevel ?? 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Source Channel</span>
                  <span className="info-value">{complaint.sourceChannel || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created</span>
                  <span className="info-value">{formatDate(complaint.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">{formatDate(complaint.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header"><h3>Description</h3></div>
            <div className="card-body">
              <p className="complaint-description">{complaint.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Attachments</h3></div>
              <div className="card-body">
                <div className="attachments-list">
                  {complaint.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url || att}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-item"
                    >
                      📎 {att.filename || att.url || `Attachment ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resolution info */}
          {complaint.status === 'resolved' && (complaint.resolutionNotes || complaint.correctiveAction) && (
            <div className="card resolution-card">
              <div className="card-header"><h3>✅ Resolution</h3></div>
              <div className="card-body">
                {complaint.resolutionNotes && (
                  <div className="resolution-section">
                    <strong>Resolution Notes:</strong>
                    <p>{complaint.resolutionNotes}</p>
                  </div>
                )}
                {complaint.correctiveAction && (
                  <div className="resolution-section">
                    <strong>Corrective Action:</strong>
                    <p>{complaint.correctiveAction}</p>
                  </div>
                )}
                {complaint.rootCause && (
                  <div className="resolution-section">
                    <strong>Root Cause:</strong>
                    <p>{complaint.rootCause}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><h3>History</h3></div>
            <div className="card-body">
              {history.length === 0 ? (
                <p className="empty-text">No history recorded.</p>
              ) : (
                <div className="timeline">
                  {history.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-action">{h.action}</span>
                          <span className="timeline-time">{formatDate(h.createdAt || h.timestamp)}</span>
                        </div>
                        {h.changedBy && (
                          <span className="timeline-by">by {h.changedBy?.name || h.changedBy}</span>
                        )}
                        {h.comment && <p className="timeline-comment">{h.comment}</p>}
                        {h.changes && (
                          <p className="timeline-changes">{JSON.stringify(h.changes)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column – admin/manager actions */}
        {isAdminOrManager && (
          <div className="complaint-sidebar">
            <div className="card">
              <div className="card-header"><h3>Actions</h3></div>
              <div className="card-body actions-panel">
                {/* Change status */}
                <div className="action-section">
                  <label className="form-label">Change Status</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                    <option value="awaiting_customer">Awaiting Customer</option>
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleStatusChange}
                    disabled={actionLoading}
                  >
                    Update Status
                  </button>
                </div>

                {/* Assign */}
                <div className="action-section">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-control"
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                  >
                    <option value="">Select staff member…</option>
                    {staffList.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleAssign}
                    disabled={actionLoading || !assignTo}
                  >
                    Assign
                  </button>
                </div>

                {/* Add comment */}
                <div className="action-section">
                  <label className="form-label">Add Comment</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Internal comment…"
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleComment}
                    disabled={actionLoading}
                  >
                    💬 Add Comment
                  </button>
                </div>

                {/* Escalate */}
                <div className="action-section">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleEscalate}
                    disabled={actionLoading}
                  >
                    🔺 Escalate
                  </button>
                </div>

                {/* Resolve */}
                {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                  <div className="action-section">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => setShowResolveModal(true)}
                      disabled={actionLoading}
                    >
                      ✅ Mark as Resolved
                    </button>
                  </div>
                )}

                {actionLoading && <LoadingSpinner size="sm" />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <Modal title="Resolve Complaint" onClose={() => setShowResolveModal(false)}>
          <div className="form-group">
            <label className="form-label">Resolution Notes *</label>
            <textarea
              className="form-control"
              rows={3}
              value={resolveForm.resolutionNotes}
              onChange={(e) => setResolveForm((f) => ({ ...f, resolutionNotes: e.target.value }))}
              placeholder="Describe how the complaint was resolved…"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Corrective Action</label>
            <textarea
              className="form-control"
              rows={2}
              value={resolveForm.correctiveAction}
              onChange={(e) => setResolveForm((f) => ({ ...f, correctiveAction: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Root Cause</label>
            <input
              className="form-control"
              type="text"
              value={resolveForm.rootCause}
              onChange={(e) => setResolveForm((f) => ({ ...f, rootCause: e.target.value }))}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleResolve} disabled={actionLoading}>
              {actionLoading ? <LoadingSpinner size="sm" /> : '✅ Resolve'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
