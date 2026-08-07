import React from 'react';

/**
 * Reusable "Coming Soon" section wrapper with a badge and placeholder content.
 *
 * @param {Object} props
 * @param {string} props.title - Section title (e.g. "Sales Overview")
 * @param {string} props.icon - Material Symbols icon name for the placeholder
 * @param {string} [props.description] - Description of what will be available
 * @param {string} [props.className] - Additional CSS classes for the outer container
 */
export default function ComingSoon({ title, icon, description, className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-md flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        <span className="text-xs bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-semibold">
          Coming Soon
        </span>
      </div>
      <div className="flex-1 bg-surface-container-low rounded-lg border border-outline-variant flex items-center justify-center min-h-[240px] relative overflow-hidden p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-40">
            {icon}
          </span>
          <p className="text-sm font-semibold text-on-surface-variant">{title} Coming Soon</p>
          {description && (
            <p className="text-xs text-on-surface-variant opacity-70 max-w-[280px]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
