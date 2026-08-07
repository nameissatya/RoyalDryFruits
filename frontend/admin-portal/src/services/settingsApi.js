import { API_BASE_URL, getAuthHeaders } from './apiConfig';

export async function fetchSettingsApi() {
  const response = await fetch(`${API_BASE_URL}/admin/AdminSettings`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch store settings');
  }
  return await response.json();
}

export async function updateSettingsApi(settingsData) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminSettings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      storeName: settingsData.storeName || 'Royal Dry Fruits',
      phone: settingsData.phone || '',
      address: settingsData.address || '',
      email: settingsData.email || '',
      latitude: Number(settingsData.latitude) || 18.9220,
      longitude: Number(settingsData.longitude) || 72.8347,
      deliveryCharge: Number(settingsData.deliveryCharge) || 50,
      minOrderValue: Number(settingsData.minOrderValue) || 500,
      freeDeliveryThreshold: Number(settingsData.freeDeliveryThreshold) || 1500,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update store settings');
  }
  return await response.json();
}
