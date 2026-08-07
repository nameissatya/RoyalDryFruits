import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary',
    secondary: 'bg-primary-container hover:bg-on-primary-container text-white',
    danger: 'bg-error hover:bg-[#a31515] text-on-error',
    success: 'bg-[#166534] hover:bg-[#14532d] text-white',
    outline: 'border border-outline-variant bg-surface hover:bg-surface-container-high text-on-surface',
    ghost: 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined mr-1.5 text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
