import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../services/authApi';
import { useAdmin } from '../context/AdminContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast, refreshAllData } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await loginAdmin(email, password);
      showToast(`Welcome back, ${result.email}!`);
      if (refreshAllData) {
        refreshAllData();
      }
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl card-shadow p-lg space-y-md">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <h2 className="font-bold text-2xl text-on-surface">Royal Dry Fruits</h2>
          <p className="text-xs text-on-surface-variant">Admin Portal Authentication</p>
        </div>

        {errorMessage && (
          <div className="bg-error-container/10 border border-error/30 text-error p-3 rounded-lg text-xs flex items-center space-x-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-md text-xs">
          <div>
            <label className="block font-semibold text-on-surface mb-1">Admin Email or Username</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                mail
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or username"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-on-surface mb-1">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center text-[11px]">
            <label className="flex items-center space-x-1.5 text-on-surface-variant cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold rounded-lg shadow-sm flex items-center justify-center space-x-2 text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-sm border-t border-outline-variant text-center text-xs text-on-surface-variant">
          <span>Don't have an admin account? </span>
          <Link to="/signup" className="font-bold text-primary hover:underline">Register Admin</Link>
        </div>
      </div>
    </div>
  );
}
