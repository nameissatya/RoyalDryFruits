import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { getStatusBadgeVariant, getStatusIcon, formatStatusLabel } from '../utils/statusUtils';

export default function OrdersPage() {
  const { orders, updateOrderStatus, loadOrders } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState(urlStatus ? urlStatus.toLowerCase() : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (urlStatus) {
      setStatusFilter(urlStatus.toLowerCase());
    }
  }, [urlStatus]);

  // Cancellation Modal State
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Print Slip Modal State
  const [printOrderTarget, setPrintOrderTarget] = useState(null);

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
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.rawId === orderId)) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancelOrderTarget) return;
    const reason = cancellationReason.trim() || 'Order declined by store admin';
    updateOrderStatus(cancelOrderTarget.id, 'Cancelled', reason);
    if (selectedOrder && (selectedOrder.id === cancelOrderTarget.id || selectedOrder.rawId === cancelOrderTarget.id)) {
      setSelectedOrder(prev => ({ ...prev, status: 'Cancelled', cancellationReason: reason }));
    }
    setIsCancelModalOpen(false);
    setCancelOrderTarget(null);
  };

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      outfordelivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach(o => {
      const s = String(o.status || 'Pending').toLowerCase().replace(/\s+/g, '');
      if (s === 'pending') counts.pending++;
      else if (s === 'confirmed' || s === 'accept' || s === 'accepted') counts.confirmed++;
      else if (s === 'outfordelivery' || s === 'dispatched' || s === 'shipped') counts.outfordelivery++;
      else if (s === 'delivered') counts.delivered++;
      else if (s === 'cancelled') counts.cancelled++;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(o => {
      if (!o) return false;
      const s = String(o.status || 'Pending').toLowerCase().replace(/\s+/g, '');
      const filterKey = statusFilter.toLowerCase().replace(/\s+/g, '');

      // Status Filter match
      if (filterKey !== 'all') {
        if (filterKey === 'dispatched' || filterKey === 'outfordelivery') {
          if (s !== 'outfordelivery' && s !== 'dispatched' && s !== 'shipped') return false;
        } else if (s !== filterKey) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = String(o.id || '').toLowerCase().includes(q);
        const nameMatch = String(o.customer || '').toLowerCase().includes(q);
        const phoneMatch = String(o.phone || '').toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const REASON_CHIPS = [
    'Item out of stock in warehouse',
    'Customer requested cancellation',
    'Delivery address unserviceable',
    'Unable to reach customer phone',
    'Pricing or inventory discrepancy',
  ];

  const handlePrintSlip = (ord) => {
    setPrintOrderTarget(ord);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getWhatsAppLink = (order) => {
    const rawPhone = String(order.phone || '').replace(/\D/g, '');
    const phoneWithCode = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = `Hello ${order.customer || 'Customer'}, regarding your Royal Dry Fruits order ${order.id}: your order status is currently "${formatStatusLabel(order.status)}". Thank you for shopping with us!`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;
  };

  // Helper for tracking steps in drawer
  const getProgressStepIndex = (status) => {
    const s = String(status || '').toLowerCase().replace(/\s+/g, '');
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 3;
    if (s === 'outfordelivery' || s === 'dispatched' || s === 'shipped') return 2;
    if (s === 'confirmed') return 1;
    return 0; // pending
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <PageHeader
        title="Orders & Operations"
        subtitle="Manage end-to-end order processing, dispatch, delivery, and customer communications."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon="refresh"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filter Tabs and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'all', label: 'All Orders', count: statusCounts.all, color: 'neutral' },
              { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'warning' },
              { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed, color: 'primary' },
              { key: 'outfordelivery', label: 'Dispatched', count: statusCounts.outfordelivery, color: 'info' },
              { key: 'delivered', label: 'Delivered', count: statusCounts.delivered, color: 'success' },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'error' },
            ].map((tab) => {
              const isActive = statusFilter.toLowerCase() === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.key);
                    if (tab.key === 'all') {
                      searchParams.delete('status');
                    } else {
                      searchParams.set('status', tab.key);
                    }
                    setSearchParams(searchParams);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Search ID, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-8 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
              search
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-surface-variant text-on-surface-variant uppercase font-semibold">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Items</th>
                <th className="py-3.5 px-5">Total</th>
                <th className="py-3.5 px-5">Payment</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-40">
                        receipt_long
                      </span>
                      <p className="font-semibold text-sm">No orders match the selected filter</p>
                      <p className="text-xs opacity-75">Try switching status tabs or clear the search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusClean = String(ord.status || '').toLowerCase().replace(/\s+/g, '');
                  const isPending = statusClean === 'pending';
                  const isConfirmed = statusClean === 'confirmed' || statusClean === 'accept' || statusClean === 'accepted';
                  const isDispatched = statusClean === 'outfordelivery' || statusClean === 'dispatched' || statusClean === 'shipped';
                  const isDelivered = statusClean === 'delivered';
                  const isCancelled = statusClean === 'cancelled';

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-surface-container-low transition-colors group ${
                        selectedOrder?.id === ord.id ? 'bg-surface-container' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-bold text-primary">{ord.id}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{ord.customer}</span>
                          <span className="text-on-surface-variant text-[11px]">{ord.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-on-surface">{ord.itemsCount}</td>
                      <td className="py-3.5 px-5 font-bold text-on-surface">
                        {typeof ord.total === 'number' ? `₹ ${ord.total.toLocaleString('en-IN')}` : ord.total}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                          {ord.payment}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={getStatusBadgeVariant(ord.status)}>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              {getStatusIcon(ord.status)}
                            </span>
                            {formatStatusLabel(ord.status)}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-on-surface-variant">{ord.date}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Details Eye Icon */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            title="View Full Order Details"
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-high cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>

                          {/* 2. Print Packing Slip */}
                          <button
                            type="button"
                            onClick={() => handlePrintSlip(ord)}
                            title="Print Packing Slip"
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-high cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">print</span>
                          </button>

                          {/* 3. Stage Action: If PENDING -> Show ACCEPT and DECLINE */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Confirmed')}
                                title="Accept Order & Confirm"
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Cancelled')}
                                title="Decline Order"
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 transition-colors rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Decline
                              </button>
                            </>
                          )}

                          {/* 4. Stage Action: If CONFIRMED -> Show DISPATCH and CANCEL */}
                          {isConfirmed && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Out for Delivery')}
                                title="Mark as Dispatched & Out for Delivery"
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 transition-colors rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                Dispatch
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Cancelled')}
                                title="Decline / Cancel Order"
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">cancel</span>
                              </button>
                            </>
                          )}

                          {/* 5. Stage Action: If DISPATCHED -> Show MARK DELIVERED and CANCEL */}
                          {isDispatched && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Delivered')}
                                title="Mark as Delivered to Customer"
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">task_alt</span>
                                Delivered
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, 'Cancelled')}
                                title="Decline / Cancel Order"
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">cancel</span>
                              </button>
                            </>
                          )}

                          {/* 6. Completed or Cancelled State Badges */}
                          {isDelivered && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">done_all</span>
                              Completed
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">close</span>
                              Declined
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3 border-t border-surface-variant flex items-center justify-between bg-surface-bright text-on-surface-variant">
          <span>
            Showing {filteredOrders.length} of {orders.length} total orders
          </span>
          <div className="text-xs font-medium">
            Royal Dry Fruits Admin Store Control
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
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <Button
                variant="outline"
                icon="print"
                onClick={() => handlePrintSlip(selectedOrder)}
              >
                Print Slip
              </Button>

              <div className="flex items-center gap-2">
                {/* State based buttons in drawer */}
                {String(selectedOrder.status || '').toLowerCase().includes('pending') && (
                  <>
                    <Button
                      variant="danger"
                      icon="cancel"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    >
                      Decline Order
                    </Button>
                    <Button
                      variant="primary"
                      icon="check_circle"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
                    >
                      Accept Order
                    </Button>
                  </>
                )}

                {String(selectedOrder.status || '').toLowerCase().includes('confirmed') && (
                  <>
                    <Button
                      variant="danger"
                      icon="cancel"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    >
                      Decline Order
                    </Button>
                    <Button
                      variant="primary"
                      icon="local_shipping"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Out for Delivery')}
                    >
                      Dispatch Order
                    </Button>
                  </>
                )}

                {(String(selectedOrder.status || '').toLowerCase().includes('outfordelivery') ||
                  String(selectedOrder.status || '').toLowerCase().includes('dispatched')) && (
                  <>
                    <Button
                      variant="danger"
                      icon="cancel"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    >
                      Cancel Order
                    </Button>
                    <Button
                      variant="primary"
                      icon="task_alt"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                    >
                      Mark as Delivered
                    </Button>
                  </>
                )}

                {String(selectedOrder.status || '').toLowerCase().includes('delivered') && (
                  <Button
                    variant="outline"
                    icon="check"
                    disabled
                  >
                    Order Completed
                  </Button>
                )}

                {String(selectedOrder.status || '').toLowerCase().includes('cancelled') && (
                  <Button
                    variant="outline"
                    icon="restart_alt"
                    onClick={() => handleStatusChange(selectedOrder.id, 'Pending')}
                  >
                    Reopen Order
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs text-on-surface">
            {/* Visual Step Progress Tracker */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant">
              <h4 className="font-semibold text-on-surface mb-3 text-xs uppercase tracking-wider text-on-surface-variant">
                Order Lifecycle Progression
              </h4>

              {String(selectedOrder.status || '').toLowerCase().includes('cancelled') ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-rose-600 text-lg">cancel</span>
                  <div>
                    <span className="font-bold text-rose-900 block">Order Declined / Cancelled</span>
                    <p className="text-rose-700 mt-0.5">
                      Reason: {selectedOrder.cancellationReason || 'Declined by store administrator'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {[
                    { title: 'Pending', label: '1. Placed', icon: 'hourglass_top' },
                    { title: 'Confirmed', label: '2. Accepted', icon: 'check_circle' },
                    { title: 'Out for Delivery', label: '3. Dispatched', icon: 'local_shipping' },
                    { title: 'Delivered', label: '4. Delivered', icon: 'task_alt' },
                  ].map((step, idx) => {
                    const currentIdx = getProgressStepIndex(selectedOrder.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step.title} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-sm font-bold transition-all ${
                            isDone
                              ? 'bg-primary text-on-primary shadow'
                              : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                          } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isDone && !isCurrent ? 'check' : step.icon}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold ${isDone ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Details & Contact Actions */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-on-surface flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base">person</span>
                  Customer Details
                </h4>
                <div className="flex items-center gap-2">
                  {selectedOrder.phone && selectedOrder.phone !== 'N/A' && (
                    <>
                      <a
                        href={`tel:${selectedOrder.phone}`}
                        className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-semibold flex items-center gap-1 border border-outline-variant cursor-pointer"
                        title="Call Customer"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        Call
                      </a>
                      <a
                        href={getWhatsAppLink(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1 border border-emerald-300 cursor-pointer"
                        title="Send WhatsApp Update"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-600">chat</span>
                        WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-on-surface-variant">
                <p className="font-bold text-on-surface text-sm">{selectedOrder.customer}</p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">phone_iphone</span>
                  {selectedOrder.phone}
                </p>
                {selectedOrder.email && selectedOrder.email !== 'N/A' && (
                  <p className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">email</span>
                    {selectedOrder.email}
                  </p>
                )}
                <p className="flex items-start gap-1.5 pt-1 border-t border-outline-variant/30">
                  <span className="material-symbols-outlined text-sm text-primary mt-0.5">location_on</span>
                  <span>{selectedOrder.address}</span>
                </p>
              </div>
            </div>

            {/* Status & Payment Banner */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                <span className="text-on-surface-variant block mb-1">Current Status</span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      {getStatusIcon(selectedOrder.status)}
                    </span>
                    {formatStatusLabel(selectedOrder.status)}
                  </span>
                </Badge>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                <span className="text-on-surface-variant block mb-1">Payment Method</span>
                <span className="font-semibold uppercase text-on-surface">{selectedOrder.payment}</span>
              </div>
            </div>

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
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Please enter or select a cancellation reason. This reason will be stored in the database and displayed to the customer on their order tracking page.
            </p>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-2">
              {REASON_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setCancellationReason(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
                  Cancellation Reason
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

      {/* Hidden / Printable Order Packing Slip for Staff */}
      {printOrderTarget && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[9999]">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">ROYAL DRY FRUITS</h1>
            <p className="text-sm text-gray-600">Packing & Delivery Slip</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><strong>Order ID:</strong> {printOrderTarget.id}</p>
              <p><strong>Date:</strong> {printOrderTarget.date}</p>
              <p><strong>Payment:</strong> {printOrderTarget.payment}</p>
            </div>
            <div>
              <p><strong>Customer:</strong> {printOrderTarget.customer}</p>
              <p><strong>Phone:</strong> {printOrderTarget.phone}</p>
              <p><strong>Address:</strong> {printOrderTarget.address}</p>
            </div>
          </div>
          <table className="w-full text-left text-sm border-t border-b py-2 mb-4">
            <thead>
              <tr className="border-b">
                <th className="py-2">Item</th>
                <th className="py-2">Qty</th>
                <th className="py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {(printOrderTarget.items || []).map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.qty}</td>
                  <td className="py-2 text-right">₹ {item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-base font-bold">
            Total: ₹ {printOrderTarget.total}
          </div>
        </div>
      )}
    </div>
  );
}
