import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_user')
      localStorage.removeItem('gym_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  activateUser: (id) => api.patch(`/users/${id}/activate`),
  suspendUser: (id) => api.patch(`/users/${id}/suspend`),
  deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserActivity: (id, params) => api.get(`/users/${id}/activity`, { params }),
  getStats: () => api.get('/users/stats'),
}

export const complaintService = {
  createComplaint: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assignComplaint: (id, data) => api.patch(`/complaints/${id}/assign`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  escalate: (id, data) => api.patch(`/complaints/${id}/escalate`, data),
  resolve: (id, data) => api.patch(`/complaints/${id}/resolve`, data),
  getHistory: (id) => api.get(`/complaints/${id}/history`),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getResolutionMetrics: () => api.get('/dashboard/resolution-metrics'),
  getRootCauseTrends: () => api.get('/dashboard/root-cause-trends'),
  getUserStats: () => api.get('/dashboard/user-stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
}

export default api
