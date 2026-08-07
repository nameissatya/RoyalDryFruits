export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = getAuthHeaders();

  // If sending FormData (e.g. image uploads), remove Content-Type header so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errData = await response.json();
        errorMessage = errData.message || errorMessage;
      } catch {
        // Fallback if error payload is not JSON
      }

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) return {};

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Make sure API is running.`);
    }
    throw error;
  }
}

