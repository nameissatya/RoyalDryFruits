import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const { settings, updateSettings } = useAdmin();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-lg max-w-7xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your store's configurations, delivery rules, and admin preferences."
      />

      <form onSubmit={handleSubmit} className="space-y-lg text-xs">
        {/* Store Information */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md md:p-lg shadow-sm space-y-md">
          <div className="border-b border-surface-variant pb-4">
            <h3 className="text-lg font-bold text-on-surface flex items-center space-x-2">
              <span className="material-symbols-outlined text-secondary text-xl">store</span>
              <span>Store Information</span>
            </h3>
            <p className="text-on-surface-variant text-xs mt-1">Basic details about your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-on-surface mb-2">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-on-surface mb-2">Store Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-surface-variant">
            <h4 className="font-semibold text-on-surface mb-1">Location Coordinates</h4>
            <p className="text-outline text-[11px] mb-4">Used for calculating the 10km COD radius.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Latitude</label>
                <input
                  type="text"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Longitude</label>
                <input
                  type="text"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
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
              <span>Delivery Settings</span>
            </h3>
            <p className="text-on-surface-variant text-xs mt-1">Configure delivery rules and charges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-on-surface mb-2">COD Radius (km)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.codRadius}
                  onChange={(e) => setFormData({ ...formData, codRadius: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-4 pr-12 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">km</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-2">Delivery Charge (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                <input
                  type="number"
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
                <span>Account Settings</span>
              </h3>
              <p className="text-on-surface-variant text-xs mt-1">Manage your admin profile.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-on-surface mb-2">Admin Name</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface mb-2">Login Email</label>
                <input
                  type="email"
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm space-y-md">
            <div className="border-b border-surface-variant pb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center space-x-2">
                <span className="material-symbols-outlined text-secondary text-xl">notifications_active</span>
                <span>Notifications</span>
              </h3>
              <p className="text-on-surface-variant text-xs mt-1">Manage alert preferences.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">WhatsApp Notifications</h4>
                  <p className="text-outline text-[11px]">Receive alerts on admin WhatsApp number</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.whatsappAlerts}
                  onChange={(e) => setFormData({ ...formData, whatsappAlerts: e.target.checked })}
                  className="w-5 h-5 text-primary bg-surface border-surface-variant rounded focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">New Order Alerts</h4>
                  <p className="text-outline text-[11px]">Get notified for every new order placed</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.orderAlerts}
                  onChange={(e) => setFormData({ ...formData, orderAlerts: e.target.checked })}
                  className="w-5 h-5 text-primary bg-surface border-surface-variant rounded focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">Low Stock Alerts</h4>
                  <p className="text-outline text-[11px]">Alert when product inventory falls below 10</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.stockAlerts}
                  onChange={(e) => setFormData({ ...formData, stockAlerts: e.target.checked })}
                  className="w-5 h-5 text-primary bg-surface border-surface-variant rounded focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </section>
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
