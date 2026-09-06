import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import TopProducts from '../components/dashboard/TopProducts';
import SalesChannelOverview from '../components/dashboard/SalesChannelOverview';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';

export default function DashboardPage() {
  const { orders, products, loadOrders, loadProducts, isOrdersLoading, isProductsLoading } = useAdmin();
  const [timeRange, setTimeRange] = useState('Today');

  // Automatically fetch fresh orders & products on mount
  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  // Filter orders dynamically based on selected time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const dateVal = o.createdAt || o.date;
      if (!dateVal) return true;
      const orderDate = new Date(dateVal);
      if (isNaN(orderDate.getTime())) return true;

      if (timeRange === 'Today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        return orderDate >= startOfDay;
      }
      if (timeRange === 'Last 7 days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return orderDate >= sevenDaysAgo;
      }
      if (timeRange === 'This Month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return orderDate >= startOfMonth;
      }
      return true;
    });
  }, [orders, timeRange]);

  const pendingOrdersCount = filteredOrders.filter((o) => {
    const s = String(o.status || '').toLowerCase().replace(/\s+/g, '');
    return s === 'pending';
  }).length;

  const totalRevenue = filteredOrders
    .filter((o) => String(o.status || '').toLowerCase().replace(/\s+/g, '') !== 'cancelled')
    .reduce((acc, o) => acc + (typeof o.total === 'number' ? o.total : 0), 0);

  // Rank top products based on ordered items in the selected time range
  const topProducts = useMemo(() => {
    const salesMap = {};
    filteredOrders.forEach((ord) => {
      if (String(ord.status || '').toLowerCase().replace(/\s+/g, '') !== 'cancelled') {
        (ord.items || []).forEach((item) => {
          const name = item.name || item.productName;
          if (name) {
            salesMap[name] = (salesMap[name] || 0) + (Number(item.qty || item.quantity) || 1);
          }
        });
      }
    });

    if (Object.keys(salesMap).length > 0) {
      return [...products].sort((a, b) => {
        const aSales = salesMap[a.name] || 0;
        const bSales = salesMap[b.name] || 0;
        return bSales - aSales;
      });
    }
    return products;
  }, [products, filteredOrders]);

  const rangeSubtitle = timeRange === 'Today' ? 'today' : timeRange === 'Last 7 days' ? 'past 7 days' : 'this month';

  const stats = [
    {
      title: 'Total Orders',
      value: filteredOrders.length,
      subtitle: `View ${rangeSubtitle} orders →`,
      subtitleColor: 'success',
      icon: 'shopping_bag',
      to: '/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: `Sales from ${rangeSubtitle}`,
      subtitleColor: 'success',
      icon: 'payments',
      to: '/orders',
    },
    {
      title: 'Total Products',
      value: products.length,
      subtitle: 'Manage catalog & stock →',
      subtitleColor: 'muted',
      icon: 'inventory',
      to: '/products',
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount,
      subtitle: pendingOrdersCount > 0 ? 'Action required →' : 'No pending orders',
      subtitleColor: 'error',
      icon: 'warning',
      variant: 'alert',
      to: '/orders?status=pending',
    },
  ];

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of store sales, recent customer orders, and catalog inventory."
        action={
          <div className="flex items-center space-x-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-xs text-xs shadow-sm">
            {['Today', 'Last 7 days', 'This Month'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`font-semibold px-sm py-1.5 rounded-md transition-all cursor-pointer ${timeRange === range
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Online vs Offline Channel Sales Analytics */}
      <SalesChannelOverview orders={filteredOrders} />

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <RecentOrdersTable orders={filteredOrders} />
        <TopProducts products={topProducts} />
      </div>

      {/* Low Stock Alerts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2">
          <LowStockAlerts products={products} />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
