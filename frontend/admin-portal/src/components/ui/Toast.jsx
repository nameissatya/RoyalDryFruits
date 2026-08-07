import React from 'react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-xl p-4 flex items-center space-x-3 z-50 animate-fadeIn text-xs">
      <div className="w-8 h-8 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#137333] shrink-0">
        <span className="material-symbols-outlined text-lg">check</span>
      </div>
      <p className="font-semibold text-on-surface">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface ml-2">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
}
