import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected Admin Portal Routes */}
      <Route path="/" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AdminLayout><ProductsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><AdminLayout><ProductFormPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/products/:productId/edit" element={<ProtectedRoute><AdminLayout><ProductFormPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><AdminLayout><CategoriesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AdminLayout><OrdersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AdminLayout><CustomersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
