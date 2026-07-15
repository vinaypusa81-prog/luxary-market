import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Central Axios instance for all API calls.
 * - 45-second timeout to handle Render free-tier cold starts (~30s wake up).
 * - Automatically attaches the Authorization Bearer token when available.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token from localStorage if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('Request timed out — the server may be waking up. Please try again in a moment.'),
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
