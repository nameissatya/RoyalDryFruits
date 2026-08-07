export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(imgUrl) {
  if (!imgUrl) return 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=500&auto=format&fit=crop&q=80';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  if (imgUrl.startsWith('/uploads/')) {
    return `${SERVER_BASE_URL}${imgUrl}`;
  }
  return imgUrl;
}

export function formatProductDto(p) {
  const primaryVariant = p.variants && p.variants.length > 0 
    ? (p.variants.find(v => v.weightLabel === '500g') || p.variants[0])
    : { weightLabel: '500g', price: 500 };

  const price = Number(primaryVariant.price) || 500;

  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    category: p.categoryName || 'Nuts & Almonds',
    weight: primaryVariant.weightLabel || '500g',
    price: price,
    originalPrice: Math.round(price * 1.15),
    rating: p.rating || 4.8,
    reviews: p.reviewsCount || 112,
    badge: p.badge || (p.isFeatured ? 'Bestseller' : 'Premium'),
    image: resolveImageUrl(p.imageUrl),
    origin: p.origin || 'India',
    description: p.description || '',
    isFeatured: p.isFeatured,
    variants: (p.variants && p.variants.length > 0)
      ? p.variants.map(v => ({ weight: v.weightLabel, price: Number(v.price), stock: v.stockQuantity }))
      : [{ weight: '500g', price: price, stock: 10 }]
  };
}

export async function fetchProductsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) {
      console.warn(`[Backend API] HTTP ${res.status} error fetching products.`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(formatProductDto);
  } catch (err) {
    console.error(`[Backend API Error] Unable to reach backend at ${API_BASE_URL}/products:`, err.message);
    return [];
  }
}

export async function fetchProductBySlugApi(slugOrId) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${slugOrId}`);
    if (res.ok) {
      const data = await res.json();
      return formatProductDto(data);
    }
    // Try lookup by ID
    const resId = await fetch(`${API_BASE_URL}/products/${slugOrId}`);
    if (resId.ok) {
      const dataId = await resId.json();
      return formatProductDto(dataId);
    }
    return null;
  } catch (err) {
    console.error(`[Backend API Error] Product lookup failed for ${slugOrId}:`, err.message);
    return null;
  }
}

export async function fetchCategoriesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`[Backend API Error] Categories lookup failed:`, err.message);
    return [];
  }
}
