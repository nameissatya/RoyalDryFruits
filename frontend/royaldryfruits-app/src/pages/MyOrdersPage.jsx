import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, ShoppingBag, MapPin, Calendar, MessageSquare, CheckCircle, Clock, Truck, XCircle, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchOrdersByPhoneApi, fetchAllOrdersApi } from '../services/orderApi'
import { resolveImageUrl } from '../services/productApi'

export default function MyOrdersPage() {
  const { user, isLoggedIn, openAuthModal } = useAuth()
  const [orders, setOrders] = useState([])
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const navigate = useNavigate()

  const loadOrders = async () => {
    if (!isLoggedIn) {
      setOrders([])
      setPhone('')
      return
    }

    try {
      const activePhone = user?.phone || user?.rawPhone || localStorage.getItem('royaldryfruits_customer_phone') || ''
      if (activePhone) {
        setPhone(activePhone)
        const localOrders = JSON.parse(localStorage.getItem('royaldryfruits_customer_orders') || '[]')
        await syncBackendOrders(activePhone, localOrders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.warn('Error loading orders page:', err)
    }
  }

  const syncBackendOrders = async (phoneToFetch, localFallback = []) => {
    if (!phoneToFetch) return
    setIsSearching(true)
    try {
      const apiOrders = await fetchOrdersByPhoneApi(phoneToFetch)
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        setOrders(formatOrdersList(apiOrders))
      } else {
        // Fallback: If direct phone query returns empty, fetch all backend orders and filter by last 10 digits
        const allApiOrders = await fetchAllOrdersApi()
        const cleanTarget = phoneToFetch.replace(/\D/g, '').slice(-10)

        const matchedBackend = (allApiOrders || []).filter(o => {
          const p = (o.customerPhone || '').replace(/\D/g, '')
          return cleanTarget && p.includes(cleanTarget)
        })

        if (matchedBackend.length > 0) {
          setOrders(formatOrdersList(matchedBackend))
        } else {
          const filteredLocal = localFallback.filter(o => {
            const p = (o.customerPhone || '').replace(/\D/g, '')
            return cleanTarget && p.includes(cleanTarget)
          })
          setOrders(filteredLocal)
        }
      }
    } catch (err) {
      console.warn('Backend phone query failed:', err)
      setOrders(localFallback)
    } finally {
      setIsSearching(false)
    }
  }

  const formatOrdersList = (rawList) => {
    return rawList.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber || `#RDF-${String(o.id).substring(0, 5)}`,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      deliveryAddress: o.deliveryAddress,
      paymentMethod: o.paymentMethod || 'COD',
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      statusLabel: getStatusLabel(o.status),
      cancellationReason: o.cancellationReason || '',
      items: (o.items || []).map(i => ({
        productName: i.productName,
        weightLabel: i.weightLabel,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        image: i.image,
      }))
    }))
  }

  const getStatusLabel = (status) => {
    if (typeof status === 'string') return status
    const statusMap = {
      0: 'Pending',
      1: 'Confirmed',
      2: 'Out For Delivery',
      3: 'Delivered',
      4: 'Cancelled',
    }
    return statusMap[status] || 'Pending'
  }

  useEffect(() => {
    loadOrders()
  }, [isLoggedIn, user])

  const getStatusBadge = (statusLabel) => {
    const s = String(statusLabel || '').toLowerCase()
    if (s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5" />
          Delivered
        </span>
      )
    }
    if (s.includes('confirmed')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          <CheckCircle className="w-3.5 h-3.5" />
          Confirmed
        </span>
      )
    }
    if (s.includes('shipped') || s.includes('processing')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
          <Truck className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
      )
    }
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    )
  }

  const formatPrice = (val) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true
    return String(o.statusLabel || '').toLowerCase().includes(statusFilter.toLowerCase())
  })

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      {/* Top Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-label text-label-md text-primary font-semibold hover:text-secondary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Link>

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-1 flex items-center gap-3">
            <Package className="w-8 h-8 text-secondary" />
            My Orders & History
          </h1>
          <p className="font-body text-body-md text-on-surface-variant flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isLoggedIn && phone ? (
              <span>Verified Customer Account: <strong className="text-primary">{phone}</strong></span>
            ) : (
              <span>Protected Account • Please login to view orders</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-full font-label text-xs font-bold capitalize transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab === 'all' ? 'All Orders' : tab}
          </button>
        ))}
      </div>

      {/* Orders List Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface-container rounded-2xl p-12 text-center border border-outline-variant/30 max-w-xl mx-auto my-8">
          <div className="w-20 h-20 rounded-full bg-secondary-container/30 text-secondary mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="font-headline text-headline-sm text-on-surface font-bold mb-2">
            {!isLoggedIn ? "Customer Login Required" : "No Orders Found"}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mb-6">
            {!isLoggedIn
              ? "To protect customer privacy, please login with your 10-digit mobile number to view your private purchase history."
              : `No purchase history found for verified mobile number "${phone}".`}
          </p>
          {!isLoggedIn ? (
            <button
              onClick={openAuthModal}
              className="px-6 py-3 rounded-full bg-secondary text-on-secondary font-label text-label-md font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Login with Mobile Number
            </button>
          ) : (
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-label text-label-md font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Explore Collections
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((ord, idx) => (
            <div
              key={ord.id || idx}
              className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header Bar */}
              <div className="p-5 bg-surface-container-high flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-headline-xs text-primary font-bold">
                        {ord.orderNumber || `#RDF-${ord.id}`}
                      </span>
                      {getStatusBadge(ord.statusLabel)}
                    </div>
                    <p className="font-body text-body-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      Placed on {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      {ord.customerName && <span className="ml-2 font-semibold">• {ord.customerName}</span>}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-label text-body-xs text-on-surface-variant">Total Amount</p>
                  <p className="font-headline text-headline-sm text-secondary font-bold">
                    {formatPrice(ord.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Cancellation Reason Banner */}
              {String(ord.statusLabel || '').toLowerCase().includes('cancel') && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Order Cancelled by Store Admin</span>
                  </div>
                  <p className="font-medium text-rose-700">
                    Reason: {ord.cancellationReason || 'Cancelled by store management'}
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="p-6 divide-y divide-outline-variant/20 space-y-4">
                {(ord.items || []).map((item, itemIdx) => (
                  <div key={itemIdx} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-surface-dim overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/30">
                        {item.image ? (
                          <img src={resolveImageUrl(item.image)} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-7 h-7 text-secondary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-body text-body-md font-bold text-on-surface">
                          {item.productName || 'Royal Dry Fruits Product'}
                        </h4>
                        <p className="font-label text-body-xs text-on-surface-variant">
                          Qty: <span className="font-bold text-on-surface">{item.quantity}</span> ({item.weightLabel || '500g'})
                        </p>
                      </div>
                    </div>

                    <div className="font-body text-body-md font-bold text-primary">
                      {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Bar */}
              <div className="px-6 py-4 bg-surface-bright border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant max-w-lg">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium truncate">{ord.deliveryAddress || 'Local Address'}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-semibold border border-outline-variant/40 uppercase text-[10px]">
                    {ord.paymentMethod || 'COD'}
                  </span>
                </div>

                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Royal Dry Fruits, I need support for my Order ${ord.orderNumber || ord.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-label font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Need Help? WhatsApp Us
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
