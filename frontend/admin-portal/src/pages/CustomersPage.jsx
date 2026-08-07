import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';

export default function CustomersPage() {
  const { customers } = useAdmin();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = (customers || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleMessageWhatsApp = (customer, e) => {
    if (e) e.stopPropagation();
    if (!customer || !customer.phone) return;
    const digits = customer.phone.replace(/\D/g, '');
    if (!digits) return;

    // Ensure 91 country code prefix for 10-digit Indian mobile numbers
    const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hello ${customer.name || 'Valued Customer'}, thank you for shopping with Royal Dry Fruits! How can we assist you today?`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles, order history, and loyalty memberships."
        action={
          <div className="relative w-full sm:w-72 text-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface outline-none focus:border-primary"
            />
          </div>
        }
      />

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-[#E2E8F0]">
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Orders</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Total Spent</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider">Last Order</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer group ${selectedCustomer?.id === c.id ? 'bg-primary-container/10' : ''
                    }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover mr-3 border border-outline-variant" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold mr-3 shadow-sm text-xs">
                          {c.initials}
                        </div>
                      )}
                      <span className="font-semibold text-on-surface">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-secondary">{c.phone}</td>
                  <td className="py-4 px-6 text-secondary text-right font-medium">{c.orders}</td>
                  <td className="py-4 px-6 font-bold text-on-surface text-right">{c.totalSpent}</td>
                  <td className="py-4 px-6 text-secondary">{c.lastOrder}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
                        className="font-semibold text-primary hover:underline px-2 py-1"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-surface-container-lowest">
          <div className="text-secondary text-xs">
            Showing <span className="font-bold text-on-surface">1</span> to <span className="font-bold text-on-surface">{filtered.length}</span> of <span className="font-bold text-on-surface">{customers.length}</span> customers
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-outline-variant rounded-md text-secondary hover:bg-surface-container-low disabled:opacity-50 transition-colors" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-primary-container bg-primary-container text-white rounded-md font-bold shadow-sm">
              1
            </button>
            <button className="px-3 py-1 border border-outline-variant rounded-md text-secondary hover:bg-surface-container-low transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide Drawer for Customer Details */}
      <Drawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
        width="sm:w-[400px]"
        footer={
          selectedCustomer && (
            <Button
              variant="success"
              fullWidth
              icon="chat"
              onClick={() => handleMessageWhatsApp(selectedCustomer)}
            >
              Message on WhatsApp
            </Button>
          )
        }
      >
        {selectedCustomer && (
          <>
            {/* Profile Hero */}
            <div className="flex flex-col items-center">
              {selectedCustomer.avatar ? (
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="h-20 w-20 rounded-full object-cover mb-3 shadow-sm border-2 border-white ring-2 ring-primary-container/20" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm border-2 border-white ring-2 ring-primary-container/20">
                  {selectedCustomer.initials}
                </div>
              )}
              <h2 className="text-base font-bold text-on-surface">{selectedCustomer.name}</h2>
              <Badge variant="primary" className="mt-2">
                {selectedCustomer.membership}
              </Badge>
            </div>

            {/* Basic Info Grid */}
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
              <div>
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">Contact</p>
                <p className="font-medium text-on-surface flex items-center">
                  <span className="material-symbols-outlined text-sm mr-2 text-secondary">call</span>
                  {selectedCustomer.phone}
                </p>
                <p className="font-medium text-on-surface flex items-center mt-1">
                  <span className="material-symbols-outlined text-sm mr-2 text-secondary">mail</span>
                  {selectedCustomer.email}
                </p>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">Joined Date</p>
                <p className="font-medium text-on-surface">{selectedCustomer.joined}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-on-surface">Recent Orders</h4>
                <span className="text-primary font-semibold hover:underline cursor-pointer">
                  View All ({selectedCustomer.orders})
                </span>
              </div>
              <div className="space-y-2.5">
                {(selectedCustomer.recentOrders || []).map((ord) => (
                  <div key={ord.id} className="p-3 border border-[#E2E8F0] rounded-lg bg-surface-container-lowest flex justify-between items-center hover:border-outline-variant transition-colors">
                    <div>
                      <p className="font-bold text-on-surface">{ord.id}</p>
                      <p className="text-secondary text-[11px]">{ord.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-on-surface">{ord.amount}</p>
                      <Badge variant="success">{ord.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
