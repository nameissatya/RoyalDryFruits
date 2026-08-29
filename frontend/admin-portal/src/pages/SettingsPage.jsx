import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import ComingSoon from '../components/ui/ComingSoon';

export default function SettingsPage() {
  const { settings, updateSettings, isSettingsLoading } = useAdmin();
  const [formData, setFormData] = useState({
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
  });

  // Synchronize form data when settings are loaded from backend
  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || '',
        phone: settings.phone || '',
        address: settings.address || '',
        email: settings.email || '',
        latitude: settings.latitude ?? settings.lat ?? '',
        longitude: settings.longitude ?? settings.lng ?? '',
        deliveryRadius: settings.deliveryRadius ?? settings.codRadius ?? '',
        deliveryCharge: settings.deliveryCharge ?? '',
        minOrderValue: settings.minOrderValue ?? '',
        freeDeliveryThreshold: settings.freeDeliveryThreshold ?? '',
        adminName: settings.adminName || '',
        loginEmail: settings.loginEmail || '',
        whatsappAlerts: Boolean(settings.whatsappAlerts),
        orderAlerts: settings.orderAlerts !== false,
        stockAlerts: settings.stockAlerts !== false,
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      latitude: formData.latitude !== '' ? Number(formData.latitude) : 0,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : 0,
      deliveryRadius: formData.deliveryRadius !== '' ? Number(formData.deliveryRadius) : 0,
      deliveryCharge: formData.deliveryCharge !== '' ? Number(formData.deliveryCharge) : 0,
      minOrderValue: formData.minOrderValue !== '' ? Number(formData.minOrderValue) : 0,
      freeDeliveryThreshold: formData.freeDeliveryThreshold !== '' ? Number(formData.freeDeliveryThreshold) : 0,
    });
  };

  return (
    <div className="space-y-lg max-w-7xl mx-auto">
      <PageHeader
        title="Store & Business Settings"
        subtitle="Configure your store details, delivery charges, COD radius, and administrative preferences."
      />

      <form onSubmit={handleSubmit} className="space-y-lg text-xs">
        {/* Store Information */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md md:p-lg shadow-sm space-y-md">
          <div className="border-b border-surface-variant pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-on-surface flex items-center space-x-2">
                <span className="material-symbols-outlined text-secondary text-xl">store</span>
                <span>Store Information</span>
              </h3>
              <p className="text-on-surface-variant text-xs mt-1">
                Enter your business contact details. These will be displayed on receipts and customer order communications.
              </p>
            </div>
            {isSettingsLoading && (
              <span className="text-xs text-primary animate-pulse font-semibold">Loading settings...</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-on-surface mb-2">Store Name</label>
              <input
                type="text"
                placeholder="Enter store name (e.g. Royal Dry Fruits)"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Business Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number (e.g. +91 90140 60329)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-on-surface mb-2">Store Address</label>
              <input
                type="text"
                placeholder="Enter physical shop / warehouse address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Business Email Address</label>
              <input
                type="email"
                placeholder="Enter official email (e.g. contact@yourstore.com)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-surface-variant">
            <h4 className="font-semibold text-on-surface mb-1">Store Coordinates (Optional)</h4>
            <p className="text-outline text-[11px] mb-4">Used for precise delivery radius calculations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 17.3850"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 78.4867"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Settings */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md md:p-lg shadow-sm space-y-md">
          <div className="border-b border-surface-variant pb-4">
            <h3 className="text-lg font-bold text-on-surface flex items-center space-x-2">
              <span className="material-symbols-outlined text-secondary text-xl">local_shipping</span>
              <span>Delivery & Pricing Settings</span>
            </h3>
            <p className="text-on-surface-variant text-xs mt-1">Set up delivery rules, thresholds, and fees for customer orders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-on-surface mb-2">COD Service Radius (km)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.deliveryRadius}
                  onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-4 pr-12 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">km</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Standard Delivery Charge (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Minimum Order Value (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Free Delivery Threshold (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Grid for Account & Notification Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Account Settings */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm space-y-md">
            <div className="border-b border-surface-variant pb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center space-x-2">
                <span className="material-symbols-outlined text-secondary text-xl">person</span>
                <span>Account Profile</span>
              </h3>
              <p className="text-on-surface-variant text-xs mt-1">Manage admin account details.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-on-surface mb-2">Admin Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shop Owner / Manager"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface mb-2">Admin Login Email</label>
                <input
                  type="email"
                  placeholder="admin@royaldryfruits.com"
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
          </section>

          {/* Notification Settings (Coming Soon) */}
          <ComingSoon
            title="Notifications & Alerts"
            icon="notifications_active"
            description="Automated WhatsApp order alerts, SMS notifications, and inventory triggers are coming soon."
          />
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="secondary" icon="save" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
