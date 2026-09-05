import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`bg-surface-container-lowest w-full ${maxWidth} rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden flex flex-col text-xs transition-all`}>
        {title && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/60">
            <h3 className="text-base font-bold text-on-surface">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[85vh]">{children}</div>
      </div>
    </div>,
    document.body
  );
}

