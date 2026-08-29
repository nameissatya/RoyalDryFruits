import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '../services/categoryApi';
import {
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../services/productApi';
import { fetchOrdersApi, updateOrderStatusApi } from '../services/orderApi';
import { fetchSettingsApi, updateSettingsApi } from '../services/settingsApi';
import { resolveImageUrl } from '../services/apiConfig';

// --- CATEGORIES HOOKS ---
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await fetchCategoriesApi();
      if (!Array.isArray(data)) return [];
      return data.map((c) => {
        const iconMap = {
          'gift': 'redeem',
          'sun': 'light_mode',
          'sparkles': 'auto_awesome',
          'nut': 'spa'
        };
        const iconName = iconMap[c.icon?.toLowerCase()] || c.icon || 'folder';
        
        return {
          id: c.id,
          name: c.name,
          description: c.description || '',
          icon: iconName,
          count: c.productCount || 0,
          isActive: c.isActive !== false,
          createdAt: c.createdAt,
        };
      });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCategoryApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// --- PRODUCTS HOOKS ---
export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await fetchProductsApi();
      if (!Array.isArray(data)) return [];
      return data.map((p) => {
        const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : {};
        return {
          id: p.id,
          categoryId: p.categoryId,
          category: p.categoryName || 'General',
          name: p.name,
          sku: firstVariant.sku || `PRD-${p.id.substring(0, 4)}`,
          price: firstVariant.price || 0,
          stock: firstVariant.stockQuantity || 0,
          status: p.isActive ? 'Active' : 'Inactive',
          img: p.imageUrl ? resolveImageUrl(p.imageUrl) : 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=150&auto=format&fit=crop&q=60',
          imageUrl: p.imageUrl || '',
          description: p.description || '',
          origin: p.origin || 'India',
          badge: p.badge || '',
          rating: p.rating ?? 0,
          reviewsCount: p.reviewsCount ?? 0,
          isActive: p.isActive !== false,
          isFeatured: p.isFeatured,
          variants: p.variants || [],
        };
      });
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProductApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// --- ORDERS HOOKS ---
export function useOrdersQuery(status = '') {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      const data = await fetchOrdersApi(status);
      if (!Array.isArray(data)) return [];
      return data.map((o) => ({
        id: o.orderNumber || `#${o.id.substring(0, 5)}`,
        rawId: o.id,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today',
        customer: o.customerName || 'Guest Customer',
        phone: o.customerPhone || 'N/A',
        email: o.customerEmail || 'N/A',
        address: o.deliveryAddress || 'Local Pickup',
        itemsCount: `${o.items ? o.items.length : 0} items`,
        total: o.totalAmount || 0,
        payment: o.paymentMethod || 'COD',
        status: o.statusLabel || o.status || 'Pending',
        items: (o.items || []).map((i) => ({
          name: `${i.productName} (${i.weightLabel})`,
          qty: i.quantity,
          price: i.totalPrice,
        })),
      }));
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// --- SETTINGS HOOKS ---
export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await fetchSettingsApi();
      if (!data || !data.id) return null;
      return {
        storeName: data.storeName || '',
        phone: data.phone || '',
        address: data.address || '',
        email: data.email || '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        freeDeliveryRadius: data.freeDeliveryRadius ?? '',
        deliveryRadius: data.deliveryRadius ?? '',
        deliveryCharge: data.deliveryCharge ?? '',
        minOrderValue: data.minOrderValue ?? '',
        freeDeliveryThreshold: data.freeDeliveryThreshold ?? '',
      };
    },
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
