import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ComingSoon from '../components/ui/ComingSoon';
import QuickActions from '../components/dashboard/QuickActions';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import TopProducts from '../components/dashboard/TopProducts';

export default function DashboardPage() {
  const { orders, products } = useAdmin();
  const [timeRange, setTimeRange] = useState('Today');

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const totalRevenue = orders.reduce(
    (acc, o) => acc + (typeof o.total === 'number' ? o.total : 2450),
    0
  );

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      subtitle: '+12% from last month',
      subtitleColor: 'success',
      icon: 'shopping_bag',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: '+8% from last month',
      subtitleColor: 'success',
      icon: 'payments',
    },
    {
      title: 'Total Products',
      value: products.length,
      subtitle: 'Active catalog items',
      subtitleColor: 'muted',
      icon: 'inventory',
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount,
      subtitle: 'Require immediate action',
      subtitleColor: 'error',
      icon: 'warning',
      variant: 'alert',
    },
  ];

  return (
    <div className="space-y-lg">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of store sales, recent customer orders, and catalog inventory."
        action={
          <div className="flex items-center space-x-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-xs text-xs">
            {['Today', 'Last 7 days', 'This Month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`font-semibold px-sm py-1.5 rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-surface-container-low text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
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

      {/* Sales Overview + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <ComingSoon
          className="lg:col-span-2"
          title="Sales Overview"
          icon="bar_chart"
          description="Revenue trends, order insights, and sales performance metrics will appear here."
        />
        <QuickActions />
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <RecentOrdersTable orders={orders} />
        <TopProducts products={products} />
      </div>
    </div>
  );
}
