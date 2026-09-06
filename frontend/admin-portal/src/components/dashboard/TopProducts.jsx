import React from 'react';

/**
 * Dashboard Top Products sidebar card.
 *
 * @param {Object} props
 * @param {Array} props.products - Array of product objects
 * @param {number} [props.limit=4] - Max number of products to display
 */
export default function TopProducts({ products, limit = 4 }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-md text-xs">
      <h3 className="text-lg font-bold text-on-surface mb-md">Top Products</h3>
      <div className="space-y-3">
        {products.slice(0, limit).map((prod) => {
          const imageSrc = prod.img || prod.image || prod.imageUrl;
          let displayPrice = prod.price;
          if (typeof displayPrice === 'number') {
            displayPrice = `₹ ${displayPrice.toLocaleString('en-IN')}`;
          } else if (typeof displayPrice === 'string') {
            const trimmed = displayPrice.trim();
            displayPrice = trimmed.startsWith('₹') ? trimmed : `₹ ${trimmed}`;
          } else if (prod.priceNumeric != null) {
            displayPrice = `₹ ${Number(prod.priceNumeric).toLocaleString('en-IN')}`;
          } else {
            displayPrice = '₹ 0';
          }

          let displayStock = prod.stock;
          if (typeof displayStock === 'number') {
            displayStock = `${displayStock} pkts stock`;
          } else if (typeof displayStock === 'string') {
            displayStock = displayStock.toLowerCase().includes('stock')
              ? displayStock
              : `${displayStock} stock`;
          }

          return (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant"
            >
              <div className="flex items-center space-x-2">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={prod.name}
                    className="w-9 h-9 rounded object-cover border border-outline-variant bg-surface-container"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant font-bold text-xs">
                    {prod.name?.charAt(0) || 'P'}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-on-surface truncate max-w-[120px]" title={prod.name}>
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">{prod.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{displayPrice}</p>
                <p className="text-[10px] text-[#16a34a] font-semibold">{displayStock}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
