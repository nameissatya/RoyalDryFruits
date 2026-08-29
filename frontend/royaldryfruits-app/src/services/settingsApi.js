export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024/api';

export async function fetchStoreSettingsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[Settings API] Failed to fetch settings:', err.message);
    return null;
  }
}
