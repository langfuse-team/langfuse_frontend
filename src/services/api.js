// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const dashboardAPI = {
  getAll: () => fetch(`${API_BASE_URL}/api/dashboards`),
  getById: (id) => fetch(`${API_BASE_URL}/api/dashboards/${id}`),
};

export const widgetAPI = {
  getAll: () => fetch(`${API_BASE_URL}/api/widgets`),
  getById: (id) => fetch(`${API_BASE_URL}/api/widgets/${id}`),
};