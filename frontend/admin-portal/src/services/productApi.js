import { API_BASE_URL, getAuthHeaders, resolveImageUrl } from './apiConfig';

export async function fetchProductsApi() {
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return await response.json();
}

export async function fetchProductByIdApi(id) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return await response.json();
}

export async function uploadProductImageApi(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts/upload-image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let msg = 'Image upload failed';
    try {
      const err = await response.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  const fullUrl = resolveImageUrl(data.imageUrl);
  return { ...data, fullUrl };
}

export async function createProductApi(productData) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      categoryId: productData.categoryId,
      name: productData.name,
      description: productData.description || '',
      imageUrl: productData.imageUrl || productData.img || '',
      origin: productData.origin || 'India',
      badge: productData.badge || '',
      rating: Number(productData.rating) || 4.8,
      reviewsCount: Number(productData.reviewsCount || productData.reviews) || 120,
      isFeatured: !!productData.isFeatured,
      variants: productData.variants || [
        { weightLabel: '250g', price: Number(productData.price250g) || Number(productData.price) || 0, stockQuantity: Number(productData.stock) || 10, sku: '' },
        { weightLabel: '500g', price: Number(productData.price500g) || (Number(productData.price) || 0) * 1.9, stockQuantity: Number(productData.stock) || 10, sku: '' },
        { weightLabel: '1kg', price: Number(productData.price1kg) || (Number(productData.price) || 0) * 3.6, stockQuantity: Number(productData.stock) || 10, sku: '' },
      ],
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create product');
  }
  return await response.json();
}

export async function updateProductApi(id, productData) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      categoryId: productData.categoryId,
      name: productData.name,
      description: productData.description || '',
      imageUrl: productData.imageUrl || productData.img || '',
      origin: productData.origin || 'India',
      badge: productData.badge || '',
      rating: Number(productData.rating) || 4.8,
      reviewsCount: Number(productData.reviewsCount || productData.reviews) || 120,
      isActive: productData.isActive !== false,
      isFeatured: !!productData.isFeatured,
      variants: productData.variants || [],
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update product');
  }
  return await response.json();
}

export async function deleteProductApi(id) {
  const response = await fetch(`${API_BASE_URL}/admin/AdminProducts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete product');
  }
  return await response.json();
}
