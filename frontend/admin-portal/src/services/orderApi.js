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
  // Map string status e.g. "Confirmed", "Cancelled", "Out for Delivery", "Delivered" to backend OrderStatus enum integer/string
  let enumStatus = status;
  if (typeof status === 'string') {
    if (status === 'Confirmed') enumStatus = 1;
    else if (status === 'Out for Delivery' || status === 'OutForDelivery') enumStatus = 2;
    else if (status === 'Delivered') enumStatus = 3;
    else if (status === 'Cancelled' || status === 'Rejected') enumStatus = 4;
    else if (status === 'Pending') enumStatus = 0;
  }

  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status: enumStatus,
      cancellationReason: cancellationReason || '',
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update order status');
  }
  return await response.json();
}
