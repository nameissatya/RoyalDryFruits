import { API_BASE_URL, getAuthHeaders } from './apiConfig';

export async function fetchOrdersApi(status = '', channel = '') {
  const params = new URLSearchParams();
  if (status && status !== 'All' && status !== 'all') params.append('status', status);
  if (channel && channel !== 'All' && channel !== 'all') params.append('channel', channel);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const url = `${API_BASE_URL}/admin/AdminOrders${queryStr}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return await response.json();
}

export async function createStoreOrderApi(orderData) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminOrders/pos`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: orderData.customerName || 'Walk-in Customer',
      customerPhone: orderData.customerPhone || '',
      customerEmail: orderData.customerEmail || '',
      deliveryAddress: orderData.deliveryAddress || 'Store Counter / Walk-in',
      paymentMethod: orderData.paymentMethod || 'Cash',
      deliveryCharge: orderData.deliveryCharge || 0,
      channel: 'Offline',
      items: (orderData.items || []).map(item => ({
        productVariantId: item.productVariantId || item.variantId || null,
        productName: item.name || item.productName || 'Product',
        weightLabel: item.weight || item.weightLabel || '500g',
        unitPrice: Number(item.price || item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || item.imageUrl || null,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create in-store POS order');
  }

  return await response.json();
}

export async function fetchOrderByIdApi(id) {
  const cleanId = encodeURIComponent(String(id || '').trim().replace(/^#/, ''));
  const response = await fetch(`${API_BASE_URL}/admin/AdminOrders/${cleanId}`, {
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

  const cleanId = encodeURIComponent(String(id || '').trim().replace(/^#/, ''));
  const response = await fetch(`${API_BASE_URL}/admin/AdminOrders/${cleanId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status: enumStatus,
      cancellationReason: cancellationReason || '',
    }),
  });

  if (!response.ok) {
    const fbResponse = await fetch(`${API_BASE_URL}/orders/${cleanId}/status`, {
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
