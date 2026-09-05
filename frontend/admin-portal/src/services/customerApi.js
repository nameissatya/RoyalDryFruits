import { API_BASE_URL } from './apiConfig';

export async function fetchCustomersApi(query = '') {
  const url = query
    ? `${API_BASE_URL}/admin/AdminCustomers?search=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/admin/AdminCustomers`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return await response.json();
}

export async function resetCustomerPinApi(customerId, newPin) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminCustomers/${customerId}/reset-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPin: String(newPin).trim() }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to reset customer PIN');
  }
  return await response.json();
}

export async function unlockCustomerApi(customerId) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminCustomers/${customerId}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to unlock customer account');
  }
  return await response.json();
}
