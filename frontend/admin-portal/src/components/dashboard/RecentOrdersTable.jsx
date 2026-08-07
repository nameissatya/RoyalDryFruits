import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { getStatusBadgeVariant } from '../../utils/statusUtils';

/**
 * Dashboard Recent Orders table with empty state support.
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects
 * @param {number} [props.limit=5] - Max number of orders to display
 */
export default function RecentOrdersTable({ orders, limit = 5 }) {
  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-md text-xs">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-lg font-bold text-on-surface">Recent Orders</h3>
        <Link to="/orders" className="text-xs font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="No recent orders"
          description="Orders will appear here once customers start placing them."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant text-on-surface-variant font-semibold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {orders.slice(0, limit).map((ord) => (
                <tr key={ord.id} className="table-row-hover">
                  <td className="py-3 font-bold text-primary">{ord.id}</td>
                  <td className="py-3 font-medium text-on-surface">{ord.customer}</td>
                  <td className="py-3 text-on-surface-variant">{ord.itemsCount}</td>
                  <td className="py-3 font-bold text-on-surface">
                    {typeof ord.total === 'number'
                      ? `₹ ${ord.total.toLocaleString('en-IN')}`
                      : ord.total}
                  </td>
                  <td className="py-3">
                    <Badge variant={getStatusBadgeVariant(ord.status)}>{ord.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
