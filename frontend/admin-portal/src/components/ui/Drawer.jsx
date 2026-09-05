import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'sm:w-[480px]',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dark Blur Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Slide Drawer Panel */}
      <div
        className={`relative w-full ${width} max-w-full h-full bg-surface-container-lowest shadow-2xl flex flex-col text-xs z-10 border-l border-outline-variant/30 transform transition-transform duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-bright shrink-0">
          <div>
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            {subtitle && <p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {/* Drawer Footer */}
        {footer && (
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
