import React from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-[#111c2d]/40 animate-fadeIn">
      <div className={`bg-surface-container-lowest w-full ${maxWidth} rounded-xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col text-xs transition-all`}>
        {title && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

