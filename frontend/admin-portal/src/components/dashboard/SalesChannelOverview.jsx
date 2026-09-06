import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SalesChannelOverview
 * Displays revenue, volume, and payment method comparison between Online Web and Offline Store POS sales.
 */
export default function SalesChannelOverview({ orders = [] }) {
  const validOrders = orders.filter(
    (o) => String(o.status || '').toLowerCase().replace(/\s+/g, '') !== 'cancelled'
  );

  const onlineOrders = validOrders.filter(
    (o) => (o.channel || 'Online').toLowerCase() === 'online'
  );
  const offlineOrders = validOrders.filter(
    (o) => (o.channel || '').toLowerCase() === 'offline'
  );

  const onlineRevenue = onlineOrders.reduce(
    (sum, o) => sum + (typeof o.total === 'number' ? o.total : 0),
    0
  );
  const offlineRevenue = offlineOrders.reduce(
    (sum, o) => sum + (typeof o.total === 'number' ? o.total : 0),
    0
  );
  const totalRevenue = onlineRevenue + offlineRevenue;

  const onlinePercent = totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 50;
  const offlinePercent = totalRevenue > 0 ? 100 - onlinePercent : 50;

  // Payment Breakdown
  const paymentBreakdown = validOrders.reduce((acc, o) => {
    const rawPay = String(o.payment || 'Other').toLowerCase();
    let key = 'Other';
    if (rawPay.includes('cash')) key = 'Cash';
    else if (rawPay.includes('upi')) key = 'UPI';
    else if (rawPay.includes('card')) key = 'Card';
    else if (rawPay.includes('cod') || rawPay.includes('delivery')) key = 'COD';
    else if (rawPay.includes('net') || rawPay.includes('online') || rawPay.includes('prepaid')) key = 'Online';

    acc[key] = (acc[key] || 0) + (typeof o.total === 'number' ? o.total : 0);
    return acc;
  }, {});

  return (
    <div className="bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-5 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">analytics</span>
            Online vs Offline Revenue Channels
          </h3>
          <p className="text-on-surface-variant text-[11px] mt-0.5">
            Compare earnings and transaction volume between Web Store and Walk-in POS Counter.
          </p>
        </div>
        <Link
          to="/pos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-xs transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">point_of_sale</span>
          <span>New POS Sale</span>
        </Link>
      </div>

      {/* Online vs Offline Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Online Web Store */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-base">language</span>
              </span>
              <div>
                <span className="font-bold text-sm text-on-surface block">Online Web Store</span>
                <span className="text-[11px] text-on-surface-variant">Website & App orders</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {onlinePercent}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-blue-50 pt-2">
            <div>
              <span className="text-xs text-on-surface-variant block">Revenue</span>
              <span className="text-lg font-extrabold text-blue-900">
                ₹{onlineRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant block">Orders</span>
              <span className="text-base font-bold text-on-surface">
                {onlineOrders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Offline Walk-in POS */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-base">storefront</span>
              </span>
              <div>
                <span className="font-bold text-sm text-on-surface block">In-Store Walk-in (POS)</span>
                <span className="text-[11px] text-on-surface-variant">Offline retail counter sales</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {offlinePercent}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-emerald-50 pt-2">
            <div>
              <span className="text-xs text-on-surface-variant block">Revenue</span>
              <span className="text-lg font-extrabold text-emerald-900">
                ₹{offlineRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant block">Sales</span>
              <span className="text-base font-bold text-on-surface">
                {offlineOrders.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Ratio Bar */}
      {totalRevenue > 0 && (
        <div className="mb-5">
          <div className="w-full bg-surface-container rounded-full h-3 flex overflow-hidden">
            <div
              style={{ width: `${onlinePercent}%` }}
              className="bg-blue-600 h-full transition-all duration-500"
              title={`Online: ${onlinePercent}%`}
            />
            <div
              style={{ width: `${offlinePercent}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Offline: ${offlinePercent}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-on-surface-variant mt-1.5 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              Online: ₹{onlineRevenue.toLocaleString('en-IN')} ({onlinePercent}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              In-Store: ₹{offlineRevenue.toLocaleString('en-IN')} ({offlinePercent}%)
            </span>
          </div>
        </div>
      )}

      {/* Payment Modes Summary */}
      <div className="border-t border-surface-container-high pt-4">
        <h4 className="font-bold text-on-surface text-xs mb-2.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">payments</span>
          Payment Methods Inflow
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'UPI / QR', key: 'UPI', icon: 'qr_code_2', color: 'text-violet-700 bg-violet-50' },
            { label: 'Cash Counter', key: 'Cash', icon: 'payments', color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Card Swipe', key: 'Card', icon: 'credit_card', color: 'text-blue-700 bg-blue-50' },
            { label: 'Cash on Delivery', key: 'COD', icon: 'local_shipping', color: 'text-amber-700 bg-amber-50' },
          ].map((mode) => (
            <div
              key={mode.key}
              className={`p-2.5 rounded-lg border border-outline-variant/60 flex flex-col justify-between ${mode.color}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold opacity-90">{mode.label}</span>
                <span className="material-symbols-outlined text-sm">{mode.icon}</span>
              </div>
              <span className="font-extrabold text-sm">
                ₹{(paymentBreakdown[mode.key] || 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
