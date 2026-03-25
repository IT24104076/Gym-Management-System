import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { userService, authService } from '../services/api.js'
import Alert from '../components/Alert.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [form, setForm] = useState({
    name: '', phone: '', address: '', dateOfBirth: '',
  })
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getMe()
        const data = res.data?.data?.user || res.data?.data || res.data
        setProfile(data)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v) })
      if (avatarFile) formData.append('avatar', avatarFile)
      const res = await userService.updateProfile(formData)
      const updated = res.data?.data?.user || res.data?.data || res.data
      updateUser(updated)
      setProfile(updated)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePwChange = (e) => {
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setPwError('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('All password fields are required.')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    setPwSaving(true)
    try {
      await authService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <LoadingSpinner center />

  const displayAvatar = avatarPreview || profile?.avatar
  const initials = getInitials(profile?.name || user?.name)

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
      </div>

      <div className="profile-layout">
        {/* Profile card */}
        <div className="card">
          <div className="card-header"><h3>Profile Information</h3></div>
          <div className="card-body">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="profile-avatar-section">
              <div className="profile-avatar profile-avatar--xl">
                {displayAvatar
                  ? <img src={displayAvatar} alt="Avatar" className="avatar-img" />
                  : <span>{initials}</span>
                }
              </div>
              <label className="btn btn-secondary btn-sm avatar-upload-label">
                📷 Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <form onSubmit={handleSaveProfile} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-control"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-control"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={profile?.email || ''}
                    readOnly
                    style={{ background: 'var(--light)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  rows={2}
                  value={form.address}
                  onChange={handleFormChange}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <LoadingSpinner size="sm" /> : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change password card */}
        <div className="card">
          <div className="card-header"><h3>Change Password</h3></div>
          <div className="card-body">
            {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} />}
            {pwSuccess && <Alert type="success" message={pwSuccess} onClose={() => setPwSuccess('')} />}
            <form onSubmit={handleChangePassword} noValidate>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  className="form-control"
                  name="currentPassword"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  className="form-control"
                  name="newPassword"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  className="form-control"
                  name="confirmPassword"
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={pwSaving}>
                {pwSaving ? <LoadingSpinner size="sm" /> : '🔒 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
