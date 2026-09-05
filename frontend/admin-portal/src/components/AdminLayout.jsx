import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { logoutAdmin, getAdminUser } from '../services/authApi';
import Toast from './ui/Toast';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toastMessage, settings, refreshAllData } = useAdmin();
  const adminUser = getAdminUser();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Refresh all data from database whenever switching pages or tabs
    if (localStorage.getItem('adminToken') && refreshAllData) {
      refreshAllData();
    }
  }, [location.pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleMobileOpen = () => {
    setMobileOpen((prev) => !prev);
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Products', path: '/products', icon: 'inventory_2' },
    { label: 'Categories', path: '/categories', icon: 'category' },
    { label: 'Orders', path: '/orders', icon: 'shopping_cart' },
    { label: 'Customers', path: '/customers', icon: 'group' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex">
      {/* SideNavBar - Fixed for desktop (lg and above) */}
      <nav className="hidden lg:flex w-sidebar-width h-screen fixed left-0 top-0 bg-on-secondary-fixed shadow-md flex-col py-md z-20">
        {/* Brand Header */}
        <div className="px-md mb-xl flex items-center space-x-md">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-primary tracking-tight">{settings.storeName || 'Royal Dry Fruits'}</h1>
            <p className="text-xs text-surface-variant opacity-80 font-medium">Admin Portal</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-xs space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                    ? 'border-l-4 border-primary bg-on-secondary-fixed-variant text-primary font-semibold'
                    : 'border-l-4 border-transparent text-surface-variant opacity-80 hover:bg-on-secondary-fixed-variant hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-md pt-md border-t border-on-secondary-fixed-variant/40">
          <div className="flex items-center justify-between text-xs text-surface-variant opacity-75">
            <span>Admin v1.0</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">ONLINE</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Side Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-on-secondary-fixed text-white z-50 lg:hidden shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        {/* Brand Header + Close Button */}
        <div className="p-4 border-b border-on-secondary-fixed-variant/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <div>
              <h1 className="font-bold text-base text-primary tracking-tight leading-tight">
                {settings.storeName || 'Royal Dry Fruits'}
              </h1>
              <p className="text-[11px] text-surface-variant opacity-80 font-medium">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-surface-variant hover:text-white p-1.5 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* User Profile Snippet */}
        <div className="px-4 py-3 bg-on-secondary-fixed-variant/30 border-b border-on-secondary-fixed-variant/40 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-xs shadow-inner">
            {adminUser?.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {adminUser?.email || 'Admin'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <span className="text-[10px] text-surface-variant font-medium">Active Session</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-on-secondary-fixed-variant text-primary font-bold shadow-sm'
                    : 'text-surface-variant opacity-85 hover:bg-on-secondary-fixed-variant/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer with Quick Logout */}
        <div className="p-4 border-t border-on-secondary-fixed-variant/40 space-y-3 bg-on-secondary-fixed">
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-error bg-error/10 hover:bg-error/20 border border-error/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out of Portal</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-surface-variant opacity-75 pt-1">
            <span>Admin v1.0</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
              ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-sidebar-width flex flex-col min-h-screen w-full min-w-0">
        {/* TopNavBar */}
        <header className="h-16 sticky top-0 bg-surface border-b border-outline-variant shadow-sm flex items-center justify-between px-4 lg:px-lg z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileOpen}
              className="lg:hidden text-on-surface-variant p-2 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors"
              aria-label="Open menu drawer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-md">
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-xs">
                {adminUser?.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <span className="text-xs font-semibold text-on-surface hidden sm:inline">
                {adminUser?.email || 'Admin'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-on-surface-variant border border-outline-variant rounded px-3 py-1.5 hover:bg-surface-container-high transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-lg max-w-max-content-width mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Reusable Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
