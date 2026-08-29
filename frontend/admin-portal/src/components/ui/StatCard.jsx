import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable stat/metric card for dashboard summary rows.
 *
 * @param {Object} props
 * @param {string} props.title - Metric label (e.g. "Total Orders")
 * @param {string|number} props.value - The metric value
 * @param {string} [props.subtitle] - Description below the value
 * @param {'success'|'error'|'muted'} [props.subtitleColor='muted'] - Subtitle text color
 * @param {string} props.icon - Material Symbols icon name
 * @param {'default'|'alert'} [props.variant='default'] - Card style variant
 * @param {string} [props.to] - Optional route URL to navigate on click
 * @param {Function} [props.onClick] - Optional click handler
 */
export default function StatCard({
  title,
  value,
  subtitle,
  subtitleColor = 'muted',
  icon,
  variant = 'default',
  to,
  onClick,
}) {
  const isAlert = variant === 'alert';

  const cardStyles = isAlert
    ? 'bg-error-container border-[#ffb4ab]'
    : 'bg-surface-container-lowest border-surface-container-highest';

  const titleStyles = isAlert
    ? 'text-on-error-container'
    : 'text-on-surface-variant';

  const valueStyles = isAlert
    ? 'text-on-error-container'
    : 'text-on-surface';

  const iconStyles = isAlert
    ? 'text-error'
    : 'text-primary-container';

  const subtitleColors = {
    success: 'text-[#16a34a]',
    error: 'text-error',
    muted: 'text-on-surface-variant',
  };

  const content = (
    <>
      <div className="flex justify-between items-start mb-sm">
        <p className={`text-sm font-semibold ${titleStyles}`}>{title}</p>
        <span className={`material-symbols-outlined ${iconStyles} text-2xl`}>{icon}</span>
      </div>
      <div>
        <h3 className={`text-2xl lg:text-3xl font-bold ${valueStyles}`}>{value}</h3>
        {subtitle && (
          <p className={`text-xs font-medium mt-1 ${subtitleColors[subtitleColor] || subtitleColors.muted}`}>
            {subtitle}
          </p>
        )}
      </div>
    </>
  );

  const hoverEffects = (to || onClick)
    ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group'
    : '';

  if (to) {
    return (
      <Link
        to={to}
        className={`${cardStyles} ${hoverEffects} p-md rounded-xl card-shadow border flex flex-col justify-between block no-underline`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${cardStyles} ${hoverEffects} p-md rounded-xl card-shadow border flex flex-col justify-between`}
    >
      {content}
    </div>
  );
}
