import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LowStockAlerts
 * Scans products and variants to alert admin about low or out-of-stock items requiring replenishment.
 */
export default function LowStockAlerts({ products = [] }) {
  // Extract all low stock variants or products
  const lowStockItems = [];

  products.forEach((p) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      p.variants.forEach((v) => {
        const qty = Number(v.stockQuantity !== undefined ? v.stockQuantity : v.stock || 0);
        if (qty <= 5) {
          lowStockItems.push({
            id: `${p.id}-${v.id || v.weight || 'var'}`,
            productId: p.id,
            productName: p.name,
            weight: v.weight || v.unit || 'Standard',
            stock: qty,
            isOut: qty <= 0,
            image: p.image || p.imageUrl,
          });
        }
      });
    } else {
      const qty = Number(p.stock !== undefined ? p.stock : 0);
      if (qty <= 5) {
        lowStockItems.push({
          id: p.id,
          productId: p.id,
          productName: p.name,
          weight: 'Standard',
          stock: qty,
          isOut: qty <= 0,
          image: p.image || p.imageUrl,
        });
      }
    }
  });

  return (
    <div className="bg-surface-container-lowest rounded-xl card-shadow border border-surface-container-highest p-5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-lg">inventory_2</span>
            <h3 className="text-base font-bold text-on-surface">Low Stock Inventory Alerts</h3>
          </div>
          <Link
            to="/inventory"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage Stock ({lowStockItems.length})
          </Link>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="py-6 text-center text-on-surface-variant flex flex-col items-center justify-center bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-emerald-600 text-3xl mb-1">
              verified
            </span>
            <span className="font-bold text-on-surface text-xs">All inventory well-stocked</span>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              No product variants are below critical minimum (5 units).
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {lowStockItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-surface-container-high flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        shopping_basket
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-on-surface block truncate">{item.productName}</span>
                    <span className="text-[10px] text-on-surface-variant">Size: {item.weight}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      item.isOut
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {item.isOut ? 'Out of Stock (0)' : `${item.stock} left`}
                  </span>
                  <Link
                    to="/inventory"
                    className="p-1 rounded hover:bg-surface-container-highest text-primary"
                    title="Update Stock"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lowStockItems.length > 0 && (
        <div className="mt-3 pt-2 border-t border-surface-container-high flex justify-between items-center text-[11px] text-on-surface-variant">
          <span>{lowStockItems.filter(i => i.isOut).length} completely out of stock</span>
          <Link to="/inventory" className="text-primary font-bold hover:underline">
            Restock Now →
          </Link>
        </div>
      )}
    </div>
  );
}
