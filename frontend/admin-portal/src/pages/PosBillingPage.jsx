import React, { useState, useMemo, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export default function PosBillingPage() {
  const { products, categories, createStoreOrder, settings } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter available products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory || p.category === selectedCategory;
      const matchQuery = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery && p.isActive !== false;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add item variant to POS cart
  const handleAddToCart = (product, variant) => {
    const itemKey = `${product.id}_${variant.id || variant.weightLabel || variant.weight || 'std'}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.key === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          productId: product.id,
          productVariantId: variant.id || null,
          name: product.name,
          weight: variant.weightLabel || variant.weight || '500g',
          price: Number(variant.price) || 0,
          quantity: 1,
          image: product.img || product.image || product.imageUrl || null,
          maxStock: variant.stock || variant.stockQuantity || 10,
        },
      ];
    });
  };

  // Update item quantity in cart
  const updateQuantity = (key, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setPaymentMethod('Cash');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal;

  // Handle Order Checkout
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);
    try {
      const orderPayload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim(),
        paymentMethod: paymentMethod,
        deliveryAddress: 'Store Counter (Walk-in)',
        deliveryCharge: 0,
        items: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          name: item.name,
          weight: item.weight,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const result = await createStoreOrder(orderPayload);
      setCompletedOrder({
        ...result,
        items: [...cartItems],
        totalAmount: totalAmount,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      clearCart();
    } catch (err) {
      console.error('Sale error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-md">
      <PageHeader
        title="In-Store POS & Quick Billing"
        subtitle="Process physical store walk-in sales, print receipts, and automatically synchronize dry fruit inventory."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        {/* Left Side: Product Catalog & Fast Variant Pickers */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-md">
          {/* Search & Category Filter Bar */}
          <div className="bg-surface-container-lowest p-sm rounded-xl border border-outline-variant flex flex-wrap gap-2 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((prod) => {
              const imageSrc = prod.img || prod.image || prod.imageUrl;
              const variants = prod.variants && prod.variants.length > 0 ? prod.variants : [{ weightLabel: '500g', price: prod.priceNumeric || 0, stock: prod.stockCount || 10 }];

              return (
                <div
                  key={prod.id}
                  className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-outline-variant bg-surface shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface border border-outline-variant flex items-center justify-center font-bold text-primary shrink-0">
                        {prod.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-on-surface truncate" title={prod.name}>
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant truncate">{prod.category}</p>
                    </div>
                  </div>

                  {/* Weight Variants Horizontal Rows */}
                  <div className="space-y-1.5 mt-2">
                    {(() => {
                      const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity !== undefined ? v.stockQuantity : (v.stock || 0)), 0);
                      return (
                        <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          <span>Pack Size</span>
                          <span className={`font-bold flex items-center gap-0.5 ${totalStock <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            <span className="material-symbols-outlined text-[11px]">inventory_2</span>
                            Stock: {totalStock} pkts
                          </span>
                        </div>
                      );
                    })()}
                    <div className="space-y-1.5">
                      {variants.map((v, vIdx) => {
                        const stockCount = v.stockQuantity !== undefined ? v.stockQuantity : (v.stock !== undefined ? v.stock : 0);
                        const isOutOfStock = stockCount <= 0;
                        const itemKey = `${prod.id}_${v.id || v.weightLabel || v.weight || 'std'}`;
                        const cartItem = cartItems.find((item) => item.key === itemKey);
                        const currentQty = cartItem ? cartItem.quantity : 0;

                        if (currentQty > 0) {
                          return (
                            <div
                              key={v.id || vIdx}
                              className="flex items-center justify-between px-2.5 py-1 rounded-lg border border-primary bg-primary/10 text-xs transition-all shadow-xs h-9"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-extrabold text-xs text-primary">₹{v.price}</span>
                                <span className="text-[11px] text-on-surface-variant truncate font-medium">({v.weightLabel || v.weight})</span>
                              </div>
                              <div className="flex items-center border border-primary/40 bg-surface-container-lowest rounded-md overflow-hidden shadow-xs shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(itemKey, -1);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-primary hover:text-on-primary text-primary font-black text-xs transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-black text-primary">{currentQty}</span>
                                <button
                                  type="button"
                                  disabled={currentQty >= stockCount}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentQty < stockCount) {
                                      updateQuantity(itemKey, 1);
                                    }
                                  }}
                                  className={`w-7 h-7 flex items-center justify-center font-black text-xs transition-colors cursor-pointer ${
                                    currentQty >= stockCount
                                      ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                                      : 'hover:bg-primary hover:text-on-primary text-primary'
                                  }`}
                                  title={currentQty >= stockCount ? 'Max store stock reached' : 'Increase quantity'}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={v.id || vIdx}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(prod, v)}
                            className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer h-9 ${
                              isOutOfStock
                                ? 'border-outline-variant/40 bg-surface-dim text-on-surface-variant/40 cursor-not-allowed'
                                : 'border-outline-variant bg-surface hover:bg-primary-container hover:border-primary hover:text-on-primary-container'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-xs text-on-surface">₹{v.price}</span>
                              <span className="text-[11px] text-on-surface-variant truncate font-medium">({v.weightLabel || v.weight})</span>
                              {isOutOfStock && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700 shrink-0">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary shrink-0">
                              <span className="material-symbols-outlined text-sm">add</span>
                              Add
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">inventory_2</span>
              <p className="font-semibold text-on-surface text-sm">No products found</p>
              <p className="text-xs text-on-surface-variant">Try searching with a different keyword or category.</p>
            </div>
          )}
        </div>

        {/* Right Side: Billing Cart & Walk-in Checkout */}
        <div className="lg:col-span-5 xl:col-span-4 bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between h-fit space-y-md">
          <div>
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">shopping_cart_checkout</span>
                Store Receipt Cart
              </h3>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-error hover:underline font-semibold cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Information (Optional) */}
            <div className="mt-sm grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-0.5">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-md px-2 py-1 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Walk-in Customer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-0.5">Phone (Optional)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-surface border border-outline-variant rounded-md px-2 py-1 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="10-digit mobile"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="mt-md divide-y divide-outline-variant max-h-[280px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.key} className="py-2 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-on-surface truncate">{item.name}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      ₹{item.price} × {item.quantity} ({item.weight})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                    <div className="flex items-center border border-outline-variant rounded-md bg-surface">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, -1)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-1.5 text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, 1)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-on-surface-variant hover:text-error ml-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="py-8 text-center text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 opacity-50">shopping_basket</span>
                  <p>Cart is empty.</p>
                  <p className="text-[11px]">Click product weight options on the left to add items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Totals Section */}
          <div className="space-y-sm pt-sm border-t border-outline-variant text-xs">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['Cash', 'UPI', 'Card'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                      paymentMethod === mode
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Total */}
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant text-sm">
              <span className="font-bold text-on-surface">Total Amount</span>
              <span className="font-headline font-bold text-lg text-primary">₹{totalAmount}</span>
            </div>

            {/* Submit / Checkout Button */}
            <Button
              className="w-full justify-center py-2.5 text-xs font-bold"
              disabled={cartItems.length === 0 || isProcessing}
              onClick={handleCompleteSale}
            >
              <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
              {isProcessing ? 'Processing Sale...' : `Complete Sale (₹${totalAmount})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Walk-in Store Receipt"
      >
        {completedOrder && (
          <div className="space-y-4 text-xs">
            {/* Printable Receipt Area */}
            <div id="printable-pos-receipt" className="p-4 bg-white text-black rounded-lg border font-mono space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-gray-400">
                <h2 className="text-base font-bold uppercase tracking-wider">{settings.storeName || 'Royal Dry Fruits'}</h2>
                <p className="text-[11px]">{settings.address || 'Experience Store, Pippara, Andhra Pradesh'}</p>
                <p className="text-[11px]">Ph: {settings.phone || '8977411009'}</p>
                <p className="text-[11px] font-bold mt-1">OFFLINE STORE INVOICE</p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill No: <strong>{completedOrder.orderNumber || completedOrder.id}</strong></span>
                  <span>{completedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: {completedOrder.customerName}</span>
                  <span>Pay: <strong>{completedOrder.paymentMethod}</strong></span>
                </div>
                {completedOrder.customerPhone && (
                  <div>Phone: {completedOrder.customerPhone}</div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-[11px] border-t border-b border-dashed border-gray-400 py-1">
                <thead>
                  <tr className="text-left font-bold">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-0.5">{it.name} ({it.weight})</td>
                      <td className="py-0.5 text-center">{it.quantity}</td>
                      <td className="py-0.5 text-right font-bold">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>NET TOTAL:</span>
                  <span>₹{completedOrder.totalAmount}</span>
                </div>
                {completedOrder.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Cash Paid:</span>
                      <span>₹{completedOrder.cashTendered}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Change:</span>
                      <span>₹{completedOrder.changeDue}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-[10px] text-gray-600 pt-2 border-t border-dashed border-gray-400">
                <p>Thank you for visiting Royal Dry Fruits!</p>
                <p>Visit us again for authentic, premium dry fruits.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePrint} className="bg-primary text-on-primary">
                <span className="material-symbols-outlined text-sm mr-1">print</span>
                Print Bill (Ctrl+P)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
