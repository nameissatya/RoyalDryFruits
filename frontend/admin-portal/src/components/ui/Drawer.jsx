import React from 'react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'sm:w-[480px]',
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-on-background/20 backdrop-blur-sm z-30 transition-opacity"
      ></div>
      <div className={`fixed inset-y-0 right-0 w-full ${width} bg-surface-container-lowest shadow-2xl z-40 transform transition-transform translate-x-0 border-l border-surface-variant flex flex-col text-xs`}>
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-bright">
          <div>
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            {subtitle && <p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {/* Drawer Footer */}
        {footer && <div className="p-4 border-t border-surface-variant bg-surface-container-lowest">{footer}</div>}
      </div>
    </>
  );
}
