import React from 'react';

/**
 * Reusable empty state placeholder.
 * Use when a list, table, or section has no data to display.
 *
 * @param {Object} props
 * @param {string} props.icon - Material Symbols icon name
 * @param {string} props.title - Primary message
 * @param {string} [props.description] - Secondary description
 */
export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-40 mb-3">
        {icon}
      </span>
      <p className="text-sm font-semibold text-on-surface-variant">{title}</p>
      {description && (
        <p className="text-xs text-on-surface-variant opacity-70 mt-1 max-w-[320px]">
          {description}
        </p>
      )}
    </div>
  );
}
