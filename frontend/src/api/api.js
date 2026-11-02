/**
 * Barangay Tinurik Portal - REST API Client
 * Communicates with the Backend EC2 Instance 2 REST API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('tinurik_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend is unreachable or CORS blocked
    if (!error.status) {
      console.error(`[API NETWORK ERROR] Cannot connect to Backend at ${url}. Check EC2 Instance 2 status and Security Groups.`, error);
      throw new Error(`Cannot reach backend server at ${API_BASE_URL}. Ensure Backend EC2 Instance is running on port 5000 with proper Security Group rules.`);
    }
    throw error;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Authentication
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getMe: () => request('/auth/me'),

  // Document Requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/requests${query ? `?${query}` : ''}`);
  },

  getRequestById: (id) => request(`/requests/${id}`),

  createRequest: (requestData) => request('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  }),

  updateRequest: (id, updateData) => request(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),

  updateRequestStatus: (id, statusData) => request(`/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }),

  deleteRequest: (id) => request(`/requests/${id}`, {
    method: 'DELETE',
  }),

  // Document Types
  getDocumentTypes: (all = false) => request(`/document-types${all ? '?all=true' : ''}`),

  createDocumentType: (typeData) => request('/document-types', {
    method: 'POST',
    body: JSON.stringify(typeData),
  }),

  updateDocumentType: (id, typeData) => request(`/document-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(typeData),
  }),

  deleteDocumentType: (id) => request(`/document-types/${id}`, {
    method: 'DELETE',
  }),

  // Resident / User Management
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },

  getUserById: (id) => request(`/users/${id}`),

  updateUser: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  updateUserStatus: (id, statusData) => request(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),
};

export { API_BASE_URL };
