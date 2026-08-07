import { API_BASE_URL } from './apiConfig';

export async function loginAdmin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/AdminAuth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({ email: data.email, role: data.role }));
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Make sure API is running.`);
    }
    throw error;
  }
}

export async function registerAdmin(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/AdminAuth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed. Please check input values.');
    }

    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({ email: data.email, role: data.role }));
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Make sure API is running.`);
    }
    throw error;
  }
}

export function logoutAdmin() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

export function getAdminUser() {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
}
