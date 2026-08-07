import React from 'react';
import { Link } from 'react-router-dom';

const actions = [
  {
    to: '/products/add',
    icon: 'add_circle',
    label: 'Add New Product',
  },
  {
    to: '/categories',
    icon: 'category',
    label: 'Manage Categories',
  },
  {
    to: '/orders',
    icon: 'shopping_cart',
    label: 'Fulfill Pending Orders',
  },
];

/**
 * Dashboard Quick Actions card.
 * Renders a list of navigational shortcuts for common admin tasks.
 */
export default function QuickActions() {
  return (
    <div className="bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-md flex flex-col justify-between text-xs">
      <div>
        <h3 className="text-base font-bold text-on-surface mb-md">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-primary">{action.icon}</span>
                <span className="font-semibold text-on-surface">{action.label}</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
