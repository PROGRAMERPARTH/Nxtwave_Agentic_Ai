import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        try {
          const { state } = JSON.parse(stored);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        // Only redirect if not already on login/register
        if (!window.location.pathname.match(/\/(login|register)$/)) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// ─── Workflow API ────────────────────────────────────────────────────
export const workflowAPI = {
  getDashboard: () => api.get('/workflows/dashboard'),
  list: (params) => api.get('/workflows', { params }),
  get: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  duplicate: (id) => api.post(`/workflows/${id}/duplicate`),
  delete: (id) => api.delete(`/workflows/${id}`),
  execute: (id, data) => api.post(`/workflows/${id}/execute`, data),
  generate: (data) => api.post('/workflows/generate', data),
};

// ─── Execution API ───────────────────────────────────────────────────
export const executionAPI = {
  list: (params) => api.get('/executions', { params }),
  get: (id) => api.get(`/executions/${id}`),
  getTimeline: (id) => api.get(`/executions/${id}/timeline`),
  pause: (id) => api.post(`/executions/${id}/pause`),
  resume: (id) => api.post(`/executions/${id}/resume`),
  cancel: (id) => api.post(`/executions/${id}/cancel`),
};

// ─── Integration API ─────────────────────────────────────────────────
export const integrationAPI = {
  list: () => api.get('/integrations'),
  getStatus: () => api.get('/integrations/status'),
  connect: (data) => api.post('/integrations/connect', data),
  test: (provider) => api.post(`/integrations/${provider}/test`),
  disconnect: (provider) => api.delete(`/integrations/${provider}`),
};

// ─── Notification API ────────────────────────────────────────────────
export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export default api;
