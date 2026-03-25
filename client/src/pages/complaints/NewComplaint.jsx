import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { complaintService } from '../../services/api.js'
import Alert from '../../components/Alert.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import '../../styles/complaints.css'

const CATEGORIES = [
  'equipment', 'cleanliness', 'staff', 'billing', 'safety', 'scheduling', 'facilities', 'other',
]

export default function NewComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null)
  }

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (!form.category) return 'Please select a category.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('priority', form.priority)
      if (file) formData.append('attachment', file)

      await complaintService.createComplaint(formData)
      navigate('/complaints')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Submit New Complaint</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          ← Back
        </button>
      </div>

      <div className="card complaint-form-card">
        <div className="card-header"><h3>Complaint Details</h3></div>
        <div className="card-body">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title *</label>
              <input
                className="form-control"
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Brief summary of your complaint"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select
                  className="form-control"
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select
                  className="form-control"
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Please describe your complaint in detail…"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="attachment">Attachment (optional)</label>
              <input
                className="form-control"
                id="attachment"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {file && (
                <small className="form-hint">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </small>
              )}
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/complaints')}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : '📤 Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
