import { API_BASE_URL, getAuthHeaders } from './apiConfig';

export async function fetchOrdersApi(status = '') {
  const url = status && status !== 'All' 
    ? `${API_BASE_URL}/admin/AdminOrders?status=${encodeURIComponent(status)}`
    : `${API_BASE_URL}/admin/AdminOrders`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return await response.json();
}

export async function fetchOrderByIdApi(id) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminOrders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch order details');
  }
  return await response.json();
}

export async function updateOrderStatusApi(id, status, cancellationReason = '') {
  let enumStatus = status;
  if (typeof status === 'string') {
    const s = status.toLowerCase().replace(/\s+/g, '');
    if (s === 'pending') enumStatus = 0;
    else if (s === 'confirmed' || s === 'accept' || s === 'accepted') enumStatus = 1;
    else if (s === 'outfordelivery' || s === 'dispatched' || s === 'dispatch' || s === 'shipped') enumStatus = 2;
    else if (s === 'delivered') enumStatus = 3;
    else if (s === 'cancelled' || s === 'decline' || s === 'declined' || s === 'rejected') enumStatus = 4;
  }

  const response = await fetch(`${API_BASE_URL}/admin/AdminOrders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status: enumStatus,
      cancellationReason: cancellationReason || '',
    }),
  });

  if (!response.ok) {
    const fbResponse = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: enumStatus,
        cancellationReason: cancellationReason || '',
      }),
    });
    if (!fbResponse.ok) {
      const err = await fbResponse.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update order status');
    }
    return await fbResponse.json();
  }
  return await response.json();
}
