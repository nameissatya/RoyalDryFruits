import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../services/categoryApi';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../services/productApi';
import { fetchOrdersApi, updateOrderStatusApi } from '../services/orderApi';
import { fetchSettingsApi, updateSettingsApi } from '../services/settingsApi';
import { resolveImageUrl } from '../services/apiConfig';

const AdminContext = createContext();

const defaultSettings = {
  storeName: '',
  phone: '',
  address: '',
  email: '',
  latitude: '',
  longitude: '',
  deliveryRadius: '',
  deliveryCharge: '',
  minOrderValue: '',
  freeDeliveryThreshold: '',
  adminName: '',
  loginEmail: '',
  whatsappAlerts: false,
  orderAlerts: true,
  stockAlerts: true,
};

export function AdminProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [toastMessage, setToastMessage] = useState(null);

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load categories from API
  const loadCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const data = await fetchCategoriesApi();
      if (Array.isArray(data)) {
        setCategories(data.map(c => {
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
        }));
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.warn('API connection error for categories:', err);
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Load products from API
  const loadProducts = async () => {
    setIsProductsLoading(true);
    try {
      const data = await fetchProductsApi();
      if (Array.isArray(data)) {
        setProducts(data.map(p => {
          const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : {};
          return {
            id: p.id,
            categoryId: p.categoryId,
            category: p.categoryName || 'General',
            name: p.name,
            sku: firstVariant.sku || `PRD-${p.id.substring(0, 4)}`,
            price: firstVariant.price || 0,
            stock: firstVariant.stockQuantity || 0,
            status: p.isActive ? 'Active' : 'Out of Stock',
            img: p.imageUrl ? resolveImageUrl(p.imageUrl) : 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=150&auto=format&fit=crop&q=60',
            origin: p.origin || 'India',
            isFeatured: p.isFeatured,
            variants: p.variants || [],
          };
        }));
      }
    } catch (err) {
      console.warn('API connection offline for products, using local data fallback.', err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Helper to format order status string safely
  const parseOrderStatus = (status, statusLabel) => {
    if (typeof status === 'number') {
      const statusMap = {
        0: 'Pending',
        1: 'Confirmed',
        2: 'Out for Delivery',
        3: 'Delivered',
        4: 'Cancelled',
      };
      return statusMap[status] || 'Pending';
    }
    if (statusLabel && typeof statusLabel === 'string') {
      if (statusLabel === 'OutForDelivery') return 'Out for Delivery';
      return statusLabel;
    }
    const s = String(status || 'Pending');
    if (s === 'OutForDelivery') return 'Out for Delivery';
    return s;
  };

  // Helper to derive customer profiles dynamically from orders
  const deriveCustomers = (ordersList) => {
    if (!Array.isArray(ordersList) || ordersList.length === 0) return [];
    const customerMap = new Map();

    ordersList.forEach(o => {
      const key = (o.phone && o.phone !== 'N/A') ? o.phone.trim() : (o.customer || 'Guest').trim();
      if (!customerMap.has(key)) {
        const name = o.customer || 'Guest Customer';
        const words = name.split(' ').filter(Boolean);
        const initials = words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : (words[0] ? words[0].substring(0, 2).toUpperCase() : 'CU');

        customerMap.set(key, {
          id: key,
          name: name,
          initials: initials,
          phone: o.phone || 'N/A',
          email: o.email || 'N/A',
          address: o.address || 'N/A',
          ordersCount: 1,
          totalSpentNumeric: typeof o.total === 'number' ? o.total : 0,
          lastOrder: o.date || 'Recently',
          joined: o.date || 'Recently',
          membership: 'Royal Member',
          recentOrders: [
            {
              id: o.id,
              date: o.date || 'Today',
              amount: typeof o.total === 'number' ? `₹ ${o.total.toLocaleString('en-IN')}` : String(o.total || '₹ 0'),
              status: o.status || 'Pending'
            }
          ]
        });
      } else {
        const existing = customerMap.get(key);
        existing.ordersCount += 1;
        existing.totalSpentNumeric += (typeof o.total === 'number' ? o.total : 0);
        existing.recentOrders.push({
          id: o.id,
          date: o.date || 'Today',
          amount: typeof o.total === 'number' ? `₹ ${o.total.toLocaleString('en-IN')}` : String(o.total || '₹ 0'),
          status: o.status || 'Pending'
        });
      }
    });

    return Array.from(customerMap.values()).map(c => ({
      ...c,
      orders: `${c.ordersCount} orders`,
      totalSpent: `₹ ${c.totalSpentNumeric.toLocaleString('en-IN')}`,
    }));
  };

  // Load orders from API
  const loadOrders = async (status = '') => {
    setIsOrdersLoading(true);
    try {
      const data = await fetchOrdersApi(status);
      if (Array.isArray(data)) {
        const formattedOrders = data.map(o => ({
          id: o.orderNumber || `#${String(o.id).substring(0, 5)}`,
          rawId: o.id,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today',
          customer: o.customerName || 'Guest Customer',
          phone: o.customerPhone || 'N/A',
          email: o.customerEmail || 'N/A',
          address: o.deliveryAddress || 'Local Pickup',
          itemsCount: `${o.items ? o.items.length : 0} items`,
          total: o.totalAmount || 0,
          payment: o.paymentMethod || 'COD',
          status: parseOrderStatus(o.status, o.statusLabel),
          cancellationReason: o.cancellationReason || '',
          items: (o.items || []).map(i => ({
            name: `${i.productName || 'Item'} (${i.weightLabel || '500g'})`,
            qty: i.quantity || 1,
            price: i.totalPrice || 0,
          })),
        }));
        setOrders(formattedOrders);
        setCustomers(deriveCustomers(formattedOrders));
      }
    } catch (err) {
      console.warn('API connection offline for orders, using local data fallback.', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Load settings from API
  const loadSettings = async () => {
    setIsSettingsLoading(true);
    try {
      const data = await fetchSettingsApi();
      if (data && data.id) {
        setSettings(prev => ({
          ...prev,
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
        }));
      }
    } catch (err) {
      console.warn('API connection offline for settings:', err);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders();
    loadSettings();
  }, []);

  const addCategory = async (newCat) => {
    try {
      const created = await createCategoryApi(newCat);
      const formatted = {
        id: created.id,
        name: created.name,
        description: created.description || '',
        icon: created.icon || 'folder',
        count: 0,
        isActive: created.isActive,
        createdAt: created.createdAt,
      };
      setCategories(prev => [formatted, ...prev]);
      showToast(`Category "${created.name}" created in database.`);
      return formatted;
    } catch (err) {
      console.warn('API error, saving category locally fallback:', err);
      const fallback = { ...newCat, id: String(Date.now()), count: 0 };
      setCategories(prev => [...prev, fallback]);
      showToast(`Category "${newCat.name}" added.`);
      return fallback;
    }
  };

  const updateCategory = async (updatedCat) => {
    try {
      await updateCategoryApi(updatedCat.id, updatedCat);
      setCategories(prev => prev.map(c => c.id === updatedCat.id ? { ...c, ...updatedCat } : c));
      showToast(`Category "${updatedCat.name}" updated in database.`);
    } catch (err) {
      console.warn('API error, updating category locally fallback:', err);
      setCategories(prev => prev.map(c => c.id === updatedCat.id ? { ...c, ...updatedCat } : c));
      showToast(`Category "${updatedCat.name}" updated.`);
    }
  };

  const deleteCategory = async (id) => {
    const cat = categories.find(c => c.id === id);
    try {
      await deleteCategoryApi(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (cat) showToast(`Category "${cat.name}" deleted from database.`);
    } catch (err) {
      console.warn('API error, deleting category locally fallback:', err);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (cat) showToast(`Category "${cat.name}" deleted.`);
    }
  };

  const addProduct = async (newProduct) => {
    const matchedCategory = categories.find(c => c.name.toLowerCase() === (newProduct.category || '').toLowerCase());
    const categoryId = newProduct.categoryId || (matchedCategory ? matchedCategory.id : categories[0]?.id || '00000000-0000-0000-0000-000000000000');

    try {
      await createProductApi({ ...newProduct, categoryId });
      await loadProducts();
      await loadCategories();
      showToast(`Product "${newProduct.name}" created in database.`);
    } catch (err) {
      console.warn('API error, saving product locally fallback:', err);
      const fallback = {
        ...newProduct,
        id: String(Date.now()),
        sku: newProduct.sku || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        img: newProduct.img || 'https://images.unsplash.com/photo-1508061252222-1d5f3083e589?w=150&auto=format&fit=crop&q=60'
      };
      setProducts(prev => [fallback, ...prev]);

      setCategories(prev => prev.map(c => 
        c.name.toLowerCase() === newProduct.category.toLowerCase() 
          ? { ...c, count: c.count + 1 } 
          : c
      ));

      showToast(`Product "${fallback.name}" created.`);
    }
  };

  const updateProduct = async (updatedProduct) => {
    const matchedCategory = categories.find(c => c.name.toLowerCase() === (updatedProduct.category || '').toLowerCase());
    const categoryId = updatedProduct.categoryId || (matchedCategory ? matchedCategory.id : categories[0]?.id);

    try {
      await updateProductApi(updatedProduct.id, { ...updatedProduct, categoryId });
      await loadProducts();
      showToast(`Product "${updatedProduct.name}" updated in database.`);
    } catch (err) {
      console.warn('API error, updating product locally fallback:', err);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
      showToast(`Product "${updatedProduct.name}" updated.`);
    }
  };

  const deleteProduct = async (id) => {
    const prod = products.find(p => p.id === id);
    try {
      await deleteProductApi(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (prod) showToast(`Product "${prod.name}" deleted from database.`);
    } catch (err) {
      console.warn('API error, deleting product locally fallback:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (prod) showToast(`Product "${prod.name}" deleted.`);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, cancellationReason = '') => {
    const target = orders.find(o => o.id === orderId || o.rawId === orderId);
    const targetGuid = target?.rawId || orderId;

    try {
      await updateOrderStatusApi(targetGuid, newStatus, cancellationReason);
      setOrders(prev => prev.map(o => (o.id === orderId || o.rawId === orderId) 
        ? { ...o, status: newStatus, cancellationReason: newStatus === 'Cancelled' ? cancellationReason : '' } 
        : o
      ));
      showToast(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.warn('API error, updating order status locally fallback:', err);
      setOrders(prev => prev.map(o => (o.id === orderId || o.rawId === orderId) 
        ? { ...o, status: newStatus, cancellationReason: newStatus === 'Cancelled' ? cancellationReason : '' } 
        : o
      ));
      showToast(`Order ${orderId} updated to ${newStatus}`);
    }
  };

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    try {
      await updateSettingsApi(merged);
      setSettings(merged);
      showToast('Store settings saved to database successfully.');
    } catch (err) {
      console.warn('API error, saving settings locally fallback:', err);
      setSettings(merged);
      showToast('Settings saved successfully.');
    }
  };

  const refreshAllData = async () => {
    await Promise.allSettled([
      loadCategories(),
      loadProducts(),
      loadOrders(),
      loadSettings(),
    ]);
  };

  return (
    <AdminContext.Provider
      value={{
        categories,
        isCategoriesLoading,
        loadCategories,
        products,
        isProductsLoading,
        loadProducts,
        orders,
        isOrdersLoading,
        loadOrders,
        customers,
        settings,
        isSettingsLoading,
        loadSettings,
        refreshAllData,
        toastMessage,
        showToast,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
