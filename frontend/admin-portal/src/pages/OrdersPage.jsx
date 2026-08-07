import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { getStatusBadgeVariant } from '../utils/statusUtils';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation Modal State
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      const ord = orders.find(o => o.id === orderId || o.rawId === orderId);
      if (ord) {
        setCancelOrderTarget(ord);
        setCancellationReason('');
        setIsCancelModalOpen(true);
      } else {
        updateOrderStatus(orderId, newStatus);
      }
    } else {
      updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancelOrderTarget) return;
    const reason = cancellationReason.trim() || 'Order cancelled by store admin';
    updateOrderStatus(cancelOrderTarget.id, 'Cancelled', reason);
    if (selectedOrder && selectedOrder.id === cancelOrderTarget.id) {
      setSelectedOrder(prev => ({ ...prev, status: 'Cancelled', cancellationReason: reason }));
    }
    setIsCancelModalOpen(false);
    setCancelOrderTarget(null);
  };

  const filtered = (orders || []).filter(o => {
    if (!o) return false;
    if (statusFilter === 'all') return true;
    const statusStr = String(o.status || 'Pending').toLowerCase();
    return statusStr === statusFilter.toLowerCase();
  });

  const REASON_CHIPS = [
    'Item out of stock',
    'Customer requested cancellation',
    'Address unserviceable',
    'Unable to reach customer phone',
  ];

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <PageHeader
        title="Orders"
        subtitle="Manage and track customer orders."
        action={
          <div className="flex items-center gap-3 text-xs">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-surface border border-outline-variant rounded-lg pl-4 pr-10 py-2.5 font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
                expand_more
              </span>
            </div>
            <Button variant="outline" icon="calendar_today">Date Range</Button>
          </div>
        }
      />

      {/* Orders Table Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-surface-variant text-on-surface-variant uppercase font-semibold">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {filtered.map((ord) => (
                <tr
                  key={ord.id}
                  className={`hover:bg-surface-container-low transition-colors group ${
                    selectedOrder?.id === ord.id ? 'bg-surface-container' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-bold text-on-surface">{ord.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">{ord.customer}</span>
                      <span className="text-on-surface-variant text-[11px]">{ord.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface">{ord.itemsCount}</td>
                  <td className="py-4 px-6 font-bold text-on-surface">
                    {typeof ord.total === 'number' ? `₹ ${ord.total.toLocaleString('en-IN')}` : ord.total}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant">
                      {ord.payment}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(ord.status)}>{ord.status}</Badge>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{ord.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details Eye Icon */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        title="View Full Order Details"
                        className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-high cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>

                      {/* Accept Order Tick Icon */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(ord.id, 'Confirmed')}
                        title="Accept Order"
                        disabled={ord.status === 'Confirmed' || ord.status === 'Delivered'}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </button>

                      {/* Decline Order Cross Icon */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(ord.id, 'Cancelled')}
                        title="Decline Order"
                        disabled={ord.status === 'Cancelled' || ord.status === 'Delivered'}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-lg">cancel</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-surface-variant flex items-center justify-between bg-surface-bright">
          <span className="text-on-surface-variant">
            Showing 1 to {filtered.length} of {orders.length} results
          </span>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 rounded border border-outline-variant text-on-surface-variant disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="p-1.5 rounded border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Order Details */}
      <Drawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.id}` : ''}
        subtitle={selectedOrder ? `Placed on ${selectedOrder.date}` : ''}
        footer={
          selectedOrder && (
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                icon="close"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
              <Button
                variant="danger"
                icon="cancel"
                disabled={selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
              >
                Decline Order
              </Button>
              <Button
                variant="primary"
                icon="check_circle"
                disabled={selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Delivered'}
                onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
              >
                Accept Order
              </Button>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs text-on-surface">
            {/* Customer Info Card */}
            <div className="bg-surface-container-low p-4 rounded-lg border border-surface-variant">
              <h4 className="font-semibold text-on-surface mb-2 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-primary text-base">person</span>
                Customer Details
              </h4>
              <div className="space-y-1 text-on-surface-variant">
                <p className="font-bold text-on-surface text-sm">{selectedOrder.customer}</p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {selectedOrder.phone}
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {selectedOrder.address}
                </p>
              </div>
            </div>

            {/* Status & Payment Banner */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                <span className="text-on-surface-variant block mb-1">Status</span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                <span className="text-on-surface-variant block mb-1">Payment Method</span>
                <span className="font-semibold uppercase text-on-surface">{selectedOrder.payment}</span>
              </div>
            </div>

            {/* Cancellation Reason if present */}
            {selectedOrder.cancellationReason && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg">
                <span className="font-bold block text-red-900 mb-0.5">Cancellation Reason:</span>
                <p className="font-medium text-red-700">{selectedOrder.cancellationReason}</p>
              </div>
            )}

            {/* Ordered Items Summary Table */}
            <div>
              <h4 className="font-semibold text-on-surface mb-3 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-primary text-base">shopping_bag</span>
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-surface-variant rounded-lg overflow-hidden divide-y divide-surface-variant">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-surface-bright">
                    <div>
                      <p className="font-semibold text-on-surface">{item.name}</p>
                      <p className="text-on-surface-variant text-[11px]">Qty: {item.qty}</p>
                    </div>
                    <span className="font-bold text-on-surface">
                      ₹ {Number(item.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Total Breakdown */}
            <div className="border-t border-surface-variant pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹ {Number(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Charge</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-surface-variant">
                <span>Total Amount</span>
                <span>₹ {Number(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Cancellation Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 border border-surface-variant shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">cancel</span>
                Decline Order {cancelOrderTarget?.id}
              </h3>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Please enter or select a cancellation reason. This reason will be displayed to the customer on their order status page.
            </p>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-2">
              {REASON_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setCancellationReason(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    cancellationReason === chip
                      ? 'bg-red-100 text-red-800 border-red-300 shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Custom Cancellation Reason
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Item currently out of stock in warehouse..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-xs text-on-surface outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                >
                  Keep Order
                </Button>
                <Button
                  variant="danger"
                  type="submit"
                  icon="cancel"
                >
                  Confirm Decline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
