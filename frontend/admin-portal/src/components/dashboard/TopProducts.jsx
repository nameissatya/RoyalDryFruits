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
        {products.slice(0, limit).map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant"
          >
            <div className="flex items-center space-x-2">
              <img
                src={prod.img}
                alt={prod.name}
                className="w-9 h-9 rounded object-cover border border-outline-variant"
              />
              <div>
                <h4 className="font-semibold text-on-surface truncate max-w-[120px]">
                  {prod.name}
                </h4>
                <p className="text-[11px] text-on-surface-variant">{prod.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">₹ {prod.price}</p>
              <p className="text-[10px] text-[#16a34a] font-semibold">{prod.stock} stock</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
