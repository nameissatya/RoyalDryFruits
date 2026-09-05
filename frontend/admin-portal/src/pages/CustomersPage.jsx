import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';

export default function CustomersPage() {
  const { customers, resetCustomerPin, unlockCustomer } = useAdmin();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');

  // Reset PIN Dialog State
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [targetCustomerForPin, setTargetCustomerForPin] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [pinResetSuccess, setPinResetSuccess] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState('');

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

    const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hello ${customer.name || 'Valued Customer'}, thank you for shopping with Royal Dry Fruits! How can we assist you today?`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenResetPin = (customer, e) => {
    if (e) e.stopPropagation();
    setTargetCustomerForPin(customer);
    setNewPin('');
    setPinError('');
    setPinResetSuccess(false);
    setIsResetPinModalOpen(true);
  };

  const handleGenerateRandomPin = () => {
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(random4);
  };

  const handleConfirmResetPin = async (e) => {
    e.preventDefault();
    setPinError('');
    if (!/^\d{4,6}$/.test(newPin.trim())) {
      setPinError('PIN must be 4 to 6 numeric digits.');
      return;
    }

    if (!targetCustomerForPin || !targetCustomerForPin.id) {
      setPinError('Invalid customer selected.');
      return;
    }

    setIsSubmittingPin(true);
    try {
      await resetCustomerPin(targetCustomerForPin.id, newPin.trim());
      setPinResetSuccess(true);
      if (selectedCustomer && selectedCustomer.id === targetCustomerForPin.id) {
        setSelectedCustomer(prev => ({ ...prev, isLocked: false, failedLoginAttempts: 0 }));
      }
    } catch (err) {
      setPinError(err.message || 'Failed to reset PIN.');
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleSendPinViaWhatsApp = () => {
    if (!targetCustomerForPin || !targetCustomerForPin.phone) return;
    const digits = targetCustomerForPin.phone.replace(/\D/g, '');
    const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hello ${targetCustomerForPin.name || 'Valued Customer'}, your temporary Royal Dry Fruits account PIN is: *${newPin}*.\n\nPlease log in with your mobile number and this temporary PIN. You will be prompted to create your new private PIN immediately upon sign in.`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUnlockCustomer = async (customer, e) => {
    if (e) e.stopPropagation();
    if (!customer || !customer.id) return;
    try {
      await unlockCustomer(customer.id);
      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer(prev => ({ ...prev, isLocked: false, failedLoginAttempts: 0 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-lg max-w-max-content-width mx-auto">
      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles, order history, and security PIN authentication."
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
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider">Auth Status</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Orders</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Total Spent</th>
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
                      <div className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold mr-3 shadow-sm text-xs">
                        {c.initials}
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface block">{c.name}</span>
                        {c.email && c.email !== 'N/A' && !c.email.includes('@royaldryfruits.com') && (
                          <span className="text-[10px] text-secondary">{c.email}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-secondary">{c.phone}</td>
                  <td className="py-4 px-6">
                    {c.isLocked ? (
                      <Badge variant="danger" className="text-[10px]">
                        🔒 Locked (5 Failed PINs)
                      </Badge>
                    ) : c.isRegistered ? (
                      <Badge variant="success" className="text-[10px]">
                        ✓ PIN Auth Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Guest Checkout
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-6 text-secondary text-right font-medium">{c.orders}</td>
                  <td className="py-4 px-6 font-bold text-on-surface text-right">{c.totalSpent}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.isRegistered && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenResetPin(c, e)}
                          className="font-semibold text-secondary hover:text-primary text-[11px] px-2 py-1 bg-surface-container-high rounded-md hover:bg-surface-container-highest transition-colors cursor-pointer"
                          title="Reset Security PIN"
                        >
                          Reset PIN
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
                        className="font-semibold text-primary hover:underline px-2 py-1"
                      >
                        Details
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
        </div>
      </div>

      {/* Slide Drawer for Customer Details */}
      <Drawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
        width="sm:w-[420px]"
        footer={
          selectedCustomer && (
            <div className="space-y-2 w-full">
              {selectedCustomer.isRegistered && (
                <Button
                  variant="primary"
                  fullWidth
                  icon="key"
                  onClick={(e) => handleOpenResetPin(selectedCustomer, e)}
                >
                  Reset Customer PIN
                </Button>
              )}
              <Button
                variant="success"
                fullWidth
                icon="chat"
                onClick={() => handleMessageWhatsApp(selectedCustomer)}
              >
                Message on WhatsApp
              </Button>
            </div>
          )
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            {/* Profile Hero */}
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm border-2 border-white ring-2 ring-primary-container/20">
                {selectedCustomer.initials}
              </div>
              <h2 className="text-base font-bold text-on-surface">{selectedCustomer.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={selectedCustomer.isRegistered ? 'primary' : 'outline'}>
                  {selectedCustomer.membership}
                </Badge>
                {selectedCustomer.isLocked && (
                  <Badge variant="danger">
                    Locked Account
                  </Badge>
                )}
              </div>
            </div>

            {/* Lockout Notice & Unlock Button */}
            {selectedCustomer.isLocked && (
              <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-xs text-on-surface flex items-center justify-between">
                <div>
                  <p className="font-bold text-error">Account Locked</p>
                  <p className="text-secondary text-[11px]">5 consecutive failed PIN attempts.</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => handleUnlockCustomer(selectedCustomer, e)}
                >
                  Unlock Now
                </Button>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3 text-xs">
              <div>
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">Contact</p>
                <p className="font-medium text-on-surface flex items-center">
                  <span className="material-symbols-outlined text-sm mr-2 text-secondary">call</span>
                  {selectedCustomer.phone}
                </p>
                {selectedCustomer.email && selectedCustomer.email !== 'N/A' && !selectedCustomer.email.includes('@royaldryfruits.com') && (
                  <p className="font-medium text-on-surface flex items-center mt-1">
                    <span className="material-symbols-outlined text-sm mr-2 text-secondary">mail</span>
                    {selectedCustomer.email}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">Account Joined</p>
                <p className="font-medium text-on-surface">{selectedCustomer.joined}</p>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="font-semibold text-secondary uppercase text-[10px] tracking-wider mb-1">Security / PIN Status</p>
                <p className="font-medium text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">security</span>
                  {selectedCustomer.isRegistered
                    ? 'Protected with encrypted PIN'
                    : 'Guest shopper (No PIN set yet)'}
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-on-surface text-xs">Recent Orders</h4>
                <span className="text-primary font-semibold text-xs">
                  Total: {selectedCustomer.orders}
                </span>
              </div>
              <div className="space-y-2.5">
                {(selectedCustomer.recentOrders || []).length === 0 ? (
                  <p className="text-secondary text-xs text-center py-4 bg-[#F8FAFC] rounded-lg">
                    No orders recorded yet.
                  </p>
                ) : (
                  (selectedCustomer.recentOrders || []).map((ord) => (
                    <div key={ord.id} className="p-3 border border-[#E2E8F0] rounded-lg bg-surface-container-lowest flex justify-between items-center hover:border-outline-variant transition-colors text-xs">
                      <div>
                        <p className="font-bold text-on-surface">{ord.id}</p>
                        <p className="text-secondary text-[11px]">{ord.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface">{ord.amount}</p>
                        <Badge variant="success">{ord.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reset PIN Modal Dialog */}
      <Modal
        isOpen={isResetPinModalOpen}
        onClose={() => setIsResetPinModalOpen(false)}
        title="Reset Customer Security PIN"
      >
        <div className="space-y-4 text-xs">
          {targetCustomerForPin && (
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="font-bold text-on-surface">{targetCustomerForPin.name}</p>
              <p className="text-secondary">{targetCustomerForPin.phone}</p>
            </div>
          )}

          {!pinResetSuccess ? (
            <form onSubmit={handleConfirmResetPin} className="space-y-4">
              <p className="text-secondary leading-relaxed">
                Enter a temporary 4 or 6-digit security PIN for this customer. When the customer logs in with this PIN, they will be required to set their own private PIN.
              </p>

              <div>
                <label className="block font-semibold text-on-surface mb-1.5">
                  Temporary PIN (4 or 6 digits)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter new PIN"
                    className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm tracking-widest font-mono text-center outline-none focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateRandomPin}
                  >
                    Random
                  </Button>
                </div>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-error-container/20 border border-error/30 text-error font-medium">
                  {pinError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPinModalOpen(false)}
                  disabled={isSubmittingPin}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingPin || !newPin}
                >
                  {isSubmittingPin ? 'Saving...' : 'Set New PIN'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center space-y-1.5">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  check_circle
                </span>
                <p className="font-bold text-green-800 text-sm">PIN Successfully Reset!</p>
                <p className="text-green-700">
                  New PIN set to: <strong className="font-mono tracking-widest text-base font-bold">{newPin}</strong>
                </p>
                <p className="text-green-600 text-[11px]">Lockout cleared. Customer can now log in immediately.</p>
              </div>

              <Button
                variant="success"
                fullWidth
                icon="chat"
                onClick={handleSendPinViaWhatsApp}
              >
                Send New PIN to Customer via WhatsApp
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsResetPinModalOpen(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
