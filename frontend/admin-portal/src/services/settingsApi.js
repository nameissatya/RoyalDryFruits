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
      storeName: settingsData.storeName || '',
      phone: settingsData.phone || '',
      address: settingsData.address || '',
      email: settingsData.email || '',
      latitude: settingsData.latitude !== '' && !isNaN(settingsData.latitude) ? Number(settingsData.latitude) : 0,
      longitude: settingsData.longitude !== '' && !isNaN(settingsData.longitude) ? Number(settingsData.longitude) : 0,
      freeDeliveryRadius: settingsData.freeDeliveryRadius !== '' && !isNaN(settingsData.freeDeliveryRadius) ? Number(settingsData.freeDeliveryRadius) : 0,
      deliveryRadius: settingsData.deliveryRadius !== '' && !isNaN(settingsData.deliveryRadius) ? Number(settingsData.deliveryRadius) : 0,
      deliveryCharge: settingsData.deliveryCharge !== '' && !isNaN(settingsData.deliveryCharge) ? Number(settingsData.deliveryCharge) : 0,
      minOrderValue: settingsData.minOrderValue !== '' && !isNaN(settingsData.minOrderValue) ? Number(settingsData.minOrderValue) : 0,
      freeDeliveryThreshold: settingsData.freeDeliveryThreshold !== '' && !isNaN(settingsData.freeDeliveryThreshold) ? Number(settingsData.freeDeliveryThreshold) : 0,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update store settings');
  }
  return await response.json();
}
