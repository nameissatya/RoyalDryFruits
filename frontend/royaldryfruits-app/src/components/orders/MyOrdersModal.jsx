import { useState, useEffect } from 'react'
import { X, Package, ShoppingBag, MapPin, Calendar, Clock, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react'
import { fetchOrdersByPhoneApi, fetchAllOrdersApi } from '../../services/orderApi'
import { resolveImageUrl } from '../../services/productApi'

export default function MyOrdersModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([])
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const loadLocalOrders = async () => {
    try {
      const savedPhone = localStorage.getItem('royaldryfruits_customer_phone') || ''
      if (savedPhone) {
        setPhone(savedPhone)
        await syncBackendOrders(savedPhone)
      } else {
        const localOrders = JSON.parse(localStorage.getItem('royaldryfruits_customer_orders') || '[]')
        setOrders(localOrders)
      }
    } catch (err) {
      console.warn('Error loading local orders:', err)
    }
  }

  const syncBackendOrders = async (targetPhone) => {
    if (!targetPhone) return
    setIsSearching(true)
    try {
      const apiOrders = await fetchOrdersByPhoneApi(targetPhone)
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        // Format API orders
        const formatted = apiOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber || `#RDF-${String(o.id).substring(0, 5)}`,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          deliveryAddress: o.deliveryAddress,
          paymentMethod: o.paymentMethod || 'COD',
          totalAmount: o.totalAmount,
          createdAt: o.createdAt,
          statusLabel: getStatusLabel(o.status),
          items: (o.items || []).map(i => ({
            productName: i.productName,
            weightLabel: i.weightLabel,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          }))
        }))
        setOrders(formatted)
      }
    } catch (err) {
      console.warn('Backend orders sync failed:', err)
    } finally {
      setIsSearching(false)
      setSearched(true)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadLocalOrders()
    }
  }, [isOpen])

  const handleSearchByPhone = (e) => {
    e.preventDefault()
    if (!phone) return
    localStorage.setItem('royaldryfruits_customer_phone', phone)
    syncBackendOrders(phone)
  }

  const getStatusLabel = (status) => {
    if (typeof status === 'string') return status
    const map = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    return map[status] || 'Pending'
  }

  const getStatusColor = (statusLabel) => {
    const s = String(statusLabel || '').toLowerCase()
    if (s.includes('delivered')) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    if (s.includes('confirmed')) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (s.includes('shipped')) return 'bg-purple-100 text-purple-800 border-purple-300'
    if (s.includes('cancel')) return 'bg-rose-100 text-rose-800 border-rose-300'
    return 'bg-amber-100 text-amber-800 border-amber-300' // Pending
  }

  const formatPrice = (val) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-headline-sm text-primary font-bold">
                My Orders
              </h2>
              <p className="font-body text-body-xs text-on-surface-variant">
                Track and view your past purchases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Lookup Input Bar */}
        <div className="px-6 py-3 bg-surface-bright border-b border-outline-variant/20">
          <form onSubmit={handleSearchByPhone} className="flex gap-2 items-center">
            <input
              type="tel"
              placeholder="Enter your phone number to find orders..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-xs font-body text-on-surface outline-none focus:border-secondary"
            />
            <button
              type="submit"
              disabled={isSearching || !phone}
              className="px-4 py-2 rounded-xl bg-secondary text-on-secondary text-xs font-label font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              Fetch
            </button>
          </form>
        </div>

        {/* Modal Body / Orders List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-headline text-body-lg text-on-surface font-semibold mb-1">
                No Orders Found
              </h3>
              <p className="font-body text-body-xs text-on-surface-variant max-w-sm mx-auto mb-4">
                {searched
                  ? `No orders found for phone number "${phone}". Place your first order today!`
                  : "You haven't placed any orders yet. Explore our delicious dry fruit collections!"}
              </p>
            </div>
          ) : (
            orders.map((ord, idx) => (
              <div
                key={ord.id || idx}
                className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-surface-container-high flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 text-xs">
                  <div>
                    <span className="font-bold text-primary text-sm font-headline">
                      {ord.orderNumber || `#RDF-${ord.id}`}
                    </span>
                    <span className="text-on-surface-variant ml-3 flex-inline items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-label text-[11px] font-bold border ${getStatusColor(ord.statusLabel)}`}>
                    {ord.statusLabel || 'Pending'}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 divide-y divide-outline-variant/20">
                  {(ord.items || []).map((item, itemIdx) => (
                    <div key={itemIdx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-dim overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/30">
                          {item.image ? (
                            <img src={resolveImageUrl(item.image)} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{item.productName || 'Dry Fruit Item'}</p>
                          <p className="text-on-surface-variant text-[11px]">
                            Qty: {item.quantity} ({item.weightLabel || '500g'})
                          </p>
                        </div>
                      </div>
                      <div className="font-semibold text-primary">
                        {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div className="px-4 py-3 bg-surface-bright border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-on-surface-variant max-w-xs truncate">
                    <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="truncate">{ord.deliveryAddress || 'Local Address'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-on-surface-variant mr-1">Total:</span>
                      <span className="font-bold text-secondary text-sm font-headline">
                        {formatPrice(ord.totalAmount)}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/919014060329?text=${encodeURIComponent(`Hi Royal Dry Fruits, I need assistance with my Order ${ord.orderNumber || ord.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-label font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Help
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-secondary text-on-secondary text-xs font-label font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
