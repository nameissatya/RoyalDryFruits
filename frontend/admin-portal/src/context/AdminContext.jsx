import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../services/categoryApi';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../services/productApi';
import { fetchOrdersApi, updateOrderStatusApi } from '../services/orderApi';
import { fetchSettingsApi, updateSettingsApi } from '../services/settingsApi';
import { fetchCustomersApi, resetCustomerPinApi, unlockCustomerApi } from '../services/customerApi';
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
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
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
            color: 'bg-primary-container text-white',
            image: c.imageUrl ? resolveImageUrl(c.imageUrl) : null,
          };
        }));
      }
    } catch (err) {
      console.warn('API error, using local categories fallback:', err);
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
          const mainVariant = (p.variants && p.variants.length > 0) ? p.variants[0] : {};
          return {
            id: p.id,
            name: p.name,
            category: p.categoryName || 'General',
            categoryId: p.categoryId,
            price: `₹ ${mainVariant.price || 0}`,
            priceNumeric: mainVariant.price || 0,
            stock: mainVariant.stockQuantity ? `${mainVariant.stockQuantity} pkts` : 'In Stock',
            stockCount: mainVariant.stockQuantity || 0,
            sku: mainVariant.sku || `RDF-${p.name.substring(0, 3).toUpperCase()}`,
            image: p.imageUrl ? resolveImageUrl(p.imageUrl) : null,
            imageUrl: p.imageUrl ? resolveImageUrl(p.imageUrl) : null,
            description: p.description || '',
            tags: p.tags ? p.tags.split(',').map(t => t.trim()) : ['Premium'],
            isActive: p.isActive !== false,
            isFeatured: p.isFeatured || false,
            badge: p.badge || '',
            variants: (p.variants || []).map(v => ({
              id: v.id,
              weight: v.weightLabel || '500g',
              weightLabel: v.weightLabel || '500g',
              price: v.price || 0,
              originalPrice: v.originalPrice || 0,
              stock: v.stockQuantity || 0,
              sku: v.sku || '',
            }))
          };
        }));
      }
    } catch (err) {
      console.warn('API error, using local products fallback:', err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Helper to parse order status
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

  // Helper to derive customer profiles dynamically from orders and merge with registered users
  const deriveCustomers = (ordersList, registeredUsers = []) => {
    const customerMap = new Map();

    // First register all real DB users
    (registeredUsers || []).forEach(u => {
      const digits = (u.phone || '').replace(/\D/g, '').slice(-10);
      const key = digits || u.id;
      const name = u.name || 'Valued Customer';
      const words = name.split(' ').filter(Boolean);
      const initials = words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : (words[0] ? words[0].substring(0, 2).toUpperCase() : 'CU');

      customerMap.set(key, {
        id: u.id,
        userId: u.id,
        name: name,
        initials: initials,
        phone: u.phone && u.phone !== 'N/A' ? (u.phone.startsWith('+91') ? u.phone : `+91 ${u.phone}`) : 'N/A',
        rawPhone: digits,
        email: u.email || 'N/A',
        address: 'Registered Customer',
        ordersCount: u.ordersCount || 0,
        totalSpentNumeric: u.totalSpent || 0,
        lastOrder: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently',
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently',
        membership: 'Verified Account',
        isRegistered: true,
        isLocked: u.isLocked || false,
        failedLoginAttempts: u.failedLoginAttempts || 0,
        lockoutEndUtc: u.lockoutEndUtc || null,
        recentOrders: []
      });
    });

    // Merge in orders
    if (Array.isArray(ordersList)) {
      ordersList.forEach(o => {
        const digits = (o.phone || '').replace(/\D/g, '').slice(-10);
        const key = digits || (o.customer || 'Guest').trim();

        if (!customerMap.has(key)) {
          const name = o.customer || 'Guest Customer';
          const words = name.split(' ').filter(Boolean);
          const initials = words.length > 1
            ? (words[0][0] + words[1][0]).toUpperCase()
            : (words[0] ? words[0].substring(0, 2).toUpperCase() : 'CU');

          customerMap.set(key, {
            id: key,
            userId: null,
            name: name,
            initials: initials,
            phone: o.phone || 'N/A',
            rawPhone: digits,
            email: o.email || 'N/A',
            address: o.address || 'N/A',
            ordersCount: 1,
            totalSpentNumeric: typeof o.total === 'number' ? o.total : 0,
            lastOrder: o.date || 'Recently',
            joined: o.date || 'Recently',
            membership: 'Guest Customer',
            isRegistered: false,
            isLocked: false,
            failedLoginAttempts: 0,
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
          if (!existing.isRegistered) {
            existing.ordersCount += 1;
            existing.totalSpentNumeric += (typeof o.total === 'number' ? o.total : 0);
          }
          if (o.address && o.address !== 'N/A' && o.address !== 'Local Pickup') {
            existing.address = o.address;
          }
          existing.recentOrders.push({
            id: o.id,
            date: o.date || 'Today',
            amount: typeof o.total === 'number' ? `₹ ${o.total.toLocaleString('en-IN')}` : String(o.total || '₹ 0'),
            status: o.status || 'Pending'
          });
        }
      });
    }

    return Array.from(customerMap.values()).map(c => ({
      ...c,
      orders: `${c.ordersCount} orders`,
      totalSpent: `₹ ${c.totalSpentNumeric.toLocaleString('en-IN')}`,
    }));
  };

  // Load customers from API
  const loadCustomers = async () => {
    setIsCustomersLoading(true);
    try {
      const data = await fetchCustomersApi();
      if (Array.isArray(data)) {
        setCustomers(deriveCustomers(orders, data));
      }
    } catch (err) {
      console.warn('Customer API fallback to orders data:', err);
      setCustomers(deriveCustomers(orders, []));
    } finally {
      setIsCustomersLoading(false);
    }
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

        // Fetch real registered customers
        try {
          const registeredUsers = await fetchCustomersApi();
          if (Array.isArray(registeredUsers)) {
            setCustomers(deriveCustomers(formattedOrders, registeredUsers));
          } else {
            setCustomers(deriveCustomers(formattedOrders, []));
          }
        } catch {
          setCustomers(deriveCustomers(formattedOrders, []));
        }
      }
    } catch (err) {
      console.warn('API connection offline for orders, using local data fallback.', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Reset Customer PIN
  const resetCustomerPin = async (customerId, newPin) => {
    try {
      await resetCustomerPinApi(customerId, newPin);
      showToast('Customer PIN reset successfully! Lockout cleared.');
      await loadCustomers();
      return true;
    } catch (err) {
      showToast(`Error resetting PIN: ${err.message}`);
      throw err;
    }
  };

  // Unlock Customer
  const unlockCustomer = async (customerId) => {
    try {
      await unlockCustomerApi(customerId);
      showToast('Customer account unlocked successfully.');
      await loadCustomers();
      return true;
    } catch (err) {
      showToast(`Error unlocking account: ${err.message}`);
      throw err;
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
      console.warn('Settings API offline, using local settings fallback:', err);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders();
    loadSettings();
  }, []);

  const addCategory = async (catData) => {
    try {
      const created = await createCategoryApi({
        name: catData.name,
        description: catData.description || '',
        icon: catData.icon || 'gift',
        imageUrl: catData.image || null,
        isActive: catData.isActive !== false,
      });
      await loadCategories();
      showToast(`Category "${catData.name}" created successfully.`);
      return created;
    } catch (err) {
      console.warn('API create error, using local state:', err);
      const newCat = {
        id: Date.now().toString(),
        name: catData.name,
        description: catData.description || '',
        icon: catData.icon || 'gift',
        count: 0,
        isActive: catData.isActive !== false,
        createdAt: new Date().toISOString(),
        color: 'bg-primary-container text-white',
        image: catData.image || null,
      };
      setCategories(prev => [newCat, ...prev]);
      showToast(`Category "${catData.name}" added successfully.`);
      return newCat;
    }
  };

  const updateCategory = async (id, catData) => {
    try {
      await updateCategoryApi(id, {
        name: catData.name,
        description: catData.description || '',
        icon: catData.icon || 'gift',
        imageUrl: catData.image || null,
        isActive: catData.isActive !== false,
      });
      await loadCategories();
      showToast(`Category "${catData.name}" updated successfully.`);
    } catch (err) {
      console.warn('API update error, using local state:', err);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...catData } : c));
      showToast(`Category "${catData.name}" updated successfully.`);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteCategoryApi(id);
      await loadCategories();
      showToast('Category deleted successfully.');
    } catch (err) {
      console.warn('API delete error, using local state:', err);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category removed successfully.');
    }
  };

  const addProduct = async (prodData) => {
    try {
      const created = await createProductApi({
        name: prodData.name,
        categoryId: prodData.categoryId,
        description: prodData.description || '',
        badge: prodData.badge || '',
        isFeatured: prodData.isFeatured || false,
        isActive: prodData.isActive !== false,
        tags: Array.isArray(prodData.tags) ? prodData.tags.join(',') : (prodData.tags || ''),
        imageUrl: prodData.image || null,
        variants: (prodData.variants || []).map(v => ({
          weightLabel: v.weight || v.weightLabel || '500g',
          price: Number(v.price) || 0,
          originalPrice: Number(v.originalPrice) || 0,
          stockQuantity: Number(v.stock) || 0,
          sku: v.sku || '',
          isDefault: true,
        }))
      });
      await loadProducts();
      showToast(`Product "${prodData.name}" created successfully.`);
      return created;
    } catch (err) {
      console.warn('API error, saving product locally:', err);
      const newProd = {
        id: Date.now().toString(),
        name: prodData.name,
        category: prodData.category || 'General',
        categoryId: prodData.categoryId,
        price: `₹ ${prodData.variants?.[0]?.price || prodData.price || 0}`,
        priceNumeric: prodData.variants?.[0]?.price || prodData.price || 0,
        stock: `${prodData.variants?.[0]?.stock || prodData.stock || 0} pkts`,
        stockCount: prodData.variants?.[0]?.stock || prodData.stock || 0,
        sku: prodData.sku || `RDF-${prodData.name.substring(0, 3).toUpperCase()}`,
        image: prodData.image || null,
        imageUrl: prodData.image || null,
        description: prodData.description || '',
        tags: Array.isArray(prodData.tags) ? prodData.tags : [prodData.tags || 'Premium'],
        isActive: prodData.isActive !== false,
        isFeatured: prodData.isFeatured || false,
        badge: prodData.badge || '',
        variants: prodData.variants || [],
      };
      setProducts(prev => [newProd, ...prev]);
      showToast(`Product "${prodData.name}" added successfully.`);
      return newProd;
    }
  };

  const updateProduct = async (id, prodData) => {
    try {
      await updateProductApi(id, {
        name: prodData.name,
        categoryId: prodData.categoryId,
        description: prodData.description || '',
        badge: prodData.badge || '',
        isFeatured: prodData.isFeatured || false,
        isActive: prodData.isActive !== false,
        tags: Array.isArray(prodData.tags) ? prodData.tags.join(',') : (prodData.tags || ''),
        imageUrl: prodData.image || null,
        variants: (prodData.variants || []).map(v => ({
          weightLabel: v.weight || v.weightLabel || '500g',
          price: Number(v.price) || 0,
          originalPrice: Number(v.originalPrice) || 0,
          stockQuantity: Number(v.stock) || 0,
          sku: v.sku || '',
          isDefault: true,
        }))
      });
      await loadProducts();
      showToast(`Product "${prodData.name}" updated successfully.`);
    } catch (err) {
      console.warn('API error, updating product locally:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...prodData } : p));
      showToast(`Product "${prodData.name}" updated successfully.`);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductApi(id);
      await loadProducts();
      showToast('Product deleted successfully.');
    } catch (err) {
      console.warn('API error, deleting product locally:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted successfully.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus, cancellationReason = '') => {
    try {
      await updateOrderStatusApi(orderId, newStatus, cancellationReason);
      await loadOrders();
      showToast(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.warn('API error, updating order locally fallback:', err);
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
      loadCustomers(),
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
        isCustomersLoading,
        loadCustomers,
        resetCustomerPin,
        unlockCustomer,
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
