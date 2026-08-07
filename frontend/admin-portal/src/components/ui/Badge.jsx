import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
  className = '',
}) {
  const variants = {
    success: 'bg-[#e6f4ea] text-[#137333]',
    warning: 'bg-[#fef9c3] text-[#854d0e]',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-secondary-container text-on-secondary-container',
    primary: 'bg-tertiary-fixed text-on-tertiary-fixed',
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
