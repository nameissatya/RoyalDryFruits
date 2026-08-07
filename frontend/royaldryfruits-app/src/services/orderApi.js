import { API_BASE_URL } from './productApi';

export async function createOrderApi(orderData) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail || '',
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod || 'COD',
      deliveryCharge: orderData.deliveryCharge || 0,
      items: (orderData.items || []).map(item => ({
        productName: item.name || 'Product',
        weightLabel: item.weight || '500g',
        unitPrice: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to place order in backend database');
  }

  return await response.json();
}

export async function fetchOrdersByPhoneApi(phone) {
  try {
    const cleanPhone = encodeURIComponent(phone.trim());
    const response = await fetch(`${API_BASE_URL}/orders/phone/${cleanPhone}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.warn('API error fetching orders by phone:', err);
    return [];
  }
}

export async function fetchAllOrdersApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.warn('API error fetching all orders:', err);
    return [];
  }
}
