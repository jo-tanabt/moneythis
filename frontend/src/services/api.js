import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const expenseAPI = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  parseText: (text) => api.post('/expenses/parse-text', { text }),
}

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

export const dashboardAPI = {
  getCategoryBreakdown: (params) => api.get('/dashboard/categories', { params }),
  getComparison: () => api.get('/dashboard/comparison'),
  getParsingAnalytics: (params) => api.get('/dashboard/parsing-analytics', { params }),
  getSummary: (params) => api.get('/dashboard/summary', { params }),
}

export const emailAPI = {
  parseEmail: (data) => api.post('/email/parse', data),
  syncEmails: (days) => api.post('/email/sync', { days }),
  getPatterns: () => api.get('/email/patterns'),
  testParse: (sampleEmail) => api.post('/email/test-parse', { sampleEmail }),
}