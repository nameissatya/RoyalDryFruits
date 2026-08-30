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
    freeDeliveryRadius: '',
    deliveryRadius: '',
    deliveryCharge: '',
    minOrderValue: '',
    freeDeliveryThreshold: '',
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
        freeDeliveryRadius: settings.freeDeliveryRadius ?? '',
        deliveryRadius: settings.deliveryRadius ?? settings.codRadius ?? '',
        deliveryCharge: settings.deliveryCharge ?? '',
        minOrderValue: settings.minOrderValue ?? '',
        freeDeliveryThreshold: settings.freeDeliveryThreshold ?? '',
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      latitude: formData.latitude !== '' ? Number(formData.latitude) : 0,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : 0,
      freeDeliveryRadius: formData.freeDeliveryRadius !== '' ? Number(formData.freeDeliveryRadius) : 0,
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
                placeholder="Enter store name"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Business Phone Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                placeholder="Enter store email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-surface-variant">
            <h4 className="font-semibold text-on-surface mb-1">Store GPS Coordinates (Optional)</h4>
            <p className="text-outline text-[11px] mb-4">Used for calculating live delivery distance from your shop.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Latitude</label>
                <input
                  type="text"
                  placeholder="Enter latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value.replace(/[^0-9.-]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Longitude</label>
                <input
                  type="text"
                  placeholder="Enter longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value.replace(/[^0-9.-]/g, '') })}
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
            <p className="text-on-surface-variant text-xs mt-1">Set up delivery rules, free delivery radius, and service ranges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Free Delivery Radius (km)</label>
              <p className="text-outline text-[11px] mb-2">Customers within this radius get 100% Free Delivery.</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter free delivery radius"
                  value={formData.freeDeliveryRadius}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryRadius: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-4 pr-12 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">km</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Max Local Service Range (km)</label>
              <p className="text-outline text-[11px] mb-2">Direct COD range. (Beyond this directs to WhatsApp Courier).</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter max service range"
                  value={formData.deliveryRadius}
                  onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-4 pr-12 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">km</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Standard Delivery Charge (₹)</label>
              <p className="text-outline text-[11px] mb-2">Fee charged between Free Radius and Max Service Range.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="text"
                  placeholder="Enter delivery charge"
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">Free Delivery Cart Total (₹)</label>
              <p className="text-outline text-[11px] mb-2">Orders above this amount get Free Delivery regardless of distance.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="text"
                  placeholder="Enter free delivery cart total"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-on-surface mb-1">Minimum Order Value (₹)</label>
              <p className="text-outline text-[11px] mb-2">Minimum cart subtotal required to place an order.</p>
              <div className="relative max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="text"
                  placeholder="Enter minimum order value"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value.replace(/[^0-9.]/g, '') })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-8 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings (Coming Soon) */}
        <ComingSoon
          title="Notifications & Alerts"
          icon="notifications_active"
          description="Automated WhatsApp order alerts, SMS notifications, and inventory triggers are coming soon."
        />

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
