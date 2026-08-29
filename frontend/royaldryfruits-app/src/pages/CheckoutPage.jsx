import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, Info, LocateFixed, Receipt, ArrowRight, Lock, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import WhatsAppIcon from '../components/common/WhatsAppIcon'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrderApi } from '../services/orderApi'
import mapImg from '../assets/images/checkout-map.jpg'
import almondsImg from '../assets/images/cat-almonds.jpg'
import cashewsImg from '../assets/images/cat-cashews.jpg'

import { getWhatsAppLink, STORE_WHATSAPP } from '../config/storeConfig'

const productImages = {
  'almond-california-500': almondsImg,
  'cashew-w320-250': cashewsImg,
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371 // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Rounded to 1 decimal place
}

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryFee: defaultDeliveryFee,
    clearCart,
    storeSettings,
    freeDeliveryThreshold,
    baseDeliveryCharge,
    minOrderValue,
    amountNeededForFreeDelivery,
  } = useCart()
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
  })

  const [customerCoords, setCustomerCoords] = useState(null)
  const [calculatedDistance, setCalculatedDistance] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Configured store radius & coordinates from database
  const freeRadius = Number(storeSettings?.freeDeliveryRadius) || 10
  const maxServiceRadius = Number(storeSettings?.deliveryRadius) || 25
  const storeLat = Number(storeSettings?.latitude)
  const storeLng = Number(storeSettings?.longitude)

  // 2-Tier Distance evaluation
  const isFreeDistanceZone = calculatedDistance !== null && calculatedDistance <= freeRadius
  const isStandardDistanceZone = calculatedDistance !== null && calculatedDistance > freeRadius && calculatedDistance <= maxServiceRadius
  const isOutsideServiceZone = calculatedDistance !== null && calculatedDistance > maxServiceRadius
  const isSubtotalEligible = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold

  // Delivery fee is 0 if within free radius OR if subtotal meets free delivery threshold
  const effectiveDeliveryFee = (isFreeDistanceZone || isSubtotalEligible || items.length === 0)
    ? 0
    : (customerCoords ? baseDeliveryCharge : defaultDeliveryFee)

  const effectiveTotal = subtotal + effectiveDeliveryFee

  // Auto-fill logged in user info
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || user.rawPhone || prev.phone,
      }))
    }
  }, [isLoggedIn, user])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.')
      return
    }

    setIsDetecting(true)
    setLocationStatus('Detecting GPS location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCustomerCoords({ lat: latitude, lng: longitude })

        // Compute distance from shop coordinates
        let distanceText = ''
        if (storeLat && storeLng) {
          const dist = calculateDistanceKm(storeLat, storeLng, latitude, longitude)
          setCalculatedDistance(dist)
          if (dist <= freeRadius) {
            distanceText = ` (${dist} km away • Within ${freeRadius}km Free Delivery zone! 🎉)`
          } else if (dist <= maxServiceRadius) {
            distanceText = ` (${dist} km away • Standard delivery charge ₹${baseDeliveryCharge})`
          } else {
            distanceText = ` (${dist} km away • Outside ${maxServiceRadius}km local delivery range)`
          }
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (res.ok) {
            const data = await res.json()
            const detectedAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setFormData((prev) => ({ ...prev, address: detectedAddress }))
            setLocationStatus(`📍 Detected: ${detectedAddress}${distanceText}`)
          } else {
            const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setFormData((prev) => ({ ...prev, address: fallbackAddr }))
            setLocationStatus(`📍 Location detected: ${fallbackAddr}${distanceText}`)
          }
        } catch {
          const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setFormData((prev) => ({ ...prev, address: fallbackAddr }))
          setLocationStatus(`📍 Location detected: ${fallbackAddr}${distanceText}`)
        } finally {
          setIsDetecting(false)
        }
      },
      (error) => {
        setIsDetecting(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Please type address manually.')
        } else {
          setLocationStatus('Unable to detect location. Please type address manually.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Geocode address when user finishes typing
  const handleAddressBlur = async () => {
    if (!formData.address.trim() || formData.address.length < 5 || !storeLat || !storeLng) return
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          setCustomerCoords({ lat, lng: lon })
          const dist = calculateDistanceKm(storeLat, storeLng, lat, lon)
          setCalculatedDistance(dist)
          if (dist <= freeRadius) {
            setLocationStatus(`📍 Address verified: ${dist} km from store (Within ${freeRadius}km Free Delivery zone! 🎉)`)
          } else if (dist <= maxServiceRadius) {
            setLocationStatus(`📍 Address verified: ${dist} km from store (Standard delivery charge ₹${baseDeliveryCharge})`)
          } else {
            setLocationStatus(`📍 Address verified: ${dist} km from store (Outside ${maxServiceRadius}km local delivery range)`)
          }
        }
      }
    } catch (err) {
      console.warn('Address geocoding note:', err.message)
    }
  }

  // Out of zone courier order via WhatsApp
  const handleWhatsAppCourierOrder = () => {
    if (!formData.fullName.trim()) {
      setSubmitError('Please enter your full name.')
      return
    }
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setSubmitError('Please enter a valid 10-digit Indian mobile number.')
      return
    }
    if (!formData.address.trim()) {
      setSubmitError('Please enter your delivery address.')
      return
    }

    let text = `Hello Royal Dry Fruits! I am placing an Out-of-Station Order:\n\n`
    text += `👤 *Customer*: ${formData.fullName.trim()}\n`
    text += `📞 *Phone*: +91 ${cleanPhone}\n`
    text += `📍 *Delivery Address*: ${formData.address.trim()}\n`
    if (calculatedDistance) {
      text += `📏 *Distance*: ${calculatedDistance} km from ${storeSettings?.storeName || 'Pippara store'}\n`
    }
    text += `\n*Order Items*:\n`
    items.forEach(i => {
      text += `• ${i.quantity}x ${i.name} (${i.weight || '500g'}) - ₹${i.price * i.quantity}\n`
    })
    text += `\n*Cart Subtotal*: ₹${subtotal}\n\n`
    text += `Please let me know the courier shipping charges and payment methods to dispatch my order. Thank you!`

    const link = getWhatsAppLink(text, storeSettings?.phone || STORE_WHATSAPP)
    window.open(link, '_blank')
  }

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault()
    setSubmitError('')

    // If outside local radius, route to WhatsApp Courier
    if (isOutsideServiceZone) {
      handleWhatsAppCourierOrder()
      return
    }

    if (!formData.fullName.trim()) {
      setSubmitError('Please enter your full name.')
      return
    }

    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setSubmitError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!formData.address.trim()) {
      setSubmitError('Please enter your delivery address.')
      return
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty.')
      return
    }

    if (minOrderValue > 0 && subtotal < minOrderValue) {
      setSubmitError(`Minimum order value is ${formatPrice(minOrderValue)}. Please add more items to continue.`)
      return
    }

    setIsSubmitting(true)
    const currentTotal = effectiveTotal

    try {
      // POST order to backend PostgreSQL database
      const createdOrder = await createOrderApi({
        customerName: formData.fullName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: formData.address.trim(),
        paymentMethod: formData.paymentMethod.toUpperCase(),
        deliveryCharge: effectiveDeliveryFee,
        items: items,
      })

      // Save order locally for instant My Orders access
      const localOrderObj = {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber || createdOrder.id,
        customerName: formData.fullName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: formData.address.trim(),
        paymentMethod: formData.paymentMethod,
        totalAmount: createdOrder.totalAmount || currentTotal,
        createdAt: new Date().toISOString(),
        statusLabel: 'Pending',
        items: items.map(i => ({
          productName: i.name,
          weightLabel: i.weight || '500g',
          unitPrice: i.price,
          quantity: i.quantity,
          totalPrice: i.price * i.quantity,
          image: i.image,
        })),
      }
      try {
        const existing = JSON.parse(localStorage.getItem('royaldryfruits_customer_orders') || '[]')
        existing.unshift(localOrderObj)
        localStorage.setItem('royaldryfruits_customer_orders', JSON.stringify(existing))
      } catch (e) {
        console.warn('LocalStorage save error:', e)
      }

      clearCart()
      navigate('/order-success', {
        state: {
          orderId: createdOrder.orderNumber || createdOrder.id,
          totalAmount: createdOrder.totalAmount || currentTotal,
        },
      })
    } catch (err) {
      console.warn('Backend order submission fallback:', err.message)
      // Fallback if backend API is offline
      const fallbackOrderId = '#RDF-' + Math.floor(10000 + Math.random() * 90000)
      const localOrderObj = {
        id: fallbackOrderId,
        orderNumber: fallbackOrderId,
        customerName: formData.fullName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: formData.address.trim(),
        paymentMethod: formData.paymentMethod,
        totalAmount: currentTotal,
        createdAt: new Date().toISOString(),
        statusLabel: 'Pending',
        items: items.map(i => ({
          productName: i.name,
          weightLabel: i.weight || '500g',
          unitPrice: i.price,
          quantity: i.quantity,
          totalPrice: i.price * i.quantity,
          image: i.image,
        })),
      }
      try {
        const existing = JSON.parse(localStorage.getItem('royaldryfruits_customer_orders') || '[]')
        existing.unshift(localOrderObj)
        localStorage.setItem('royaldryfruits_customer_orders', JSON.stringify(existing))
      } catch (e) {
        console.warn('LocalStorage save error:', e)
      }

      clearCart()
      navigate('/order-success', {
        state: {
          orderId: fallbackOrderId,
          totalAmount: currentTotal,
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">
          Checkout
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Complete your order securely with Cash on Delivery or WhatsApp Courier Shipping.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* STEP 1: Customer Details */}
          <section className="bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-on-primary">
                  1
                </div>
                Customer & Contact Details
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md text-on-surface font-semibold" htmlFor="fullName">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md text-on-surface font-semibold" htmlFor="phone">
                    Mobile Number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-on-surface-variant font-bold font-body">+91</span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-14 pr-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: Delivery Address */}
          <section className="bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-on-primary">
                  2
                </div>
                Delivery Address
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Dynamic Service Radius Banner */}
              {isOutsideServiceZone ? (
                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-900">
                      📍 Your location is {calculatedDistance} km away (Outside our {maxServiceRadius}km local delivery range).
                    </p>
                    <p className="text-amber-800">
                      We dispatch out-of-town orders across India via <strong>Speed Post / Professional Courier</strong>. Click <strong>"Order on WhatsApp"</strong> below to arrange courier shipping and receive your parcel safely!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-secondary-container/20 p-4 rounded-lg border border-secondary-container/30">
                  <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="font-body text-body-md text-on-surface-variant">
                    <span className="font-semibold text-secondary">Free Fast Delivery within {freeRadius}km radius</span> (Local service range up to {maxServiceRadius}km). Please enter your complete delivery address or click detect below.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface font-semibold" htmlFor="address">
                  Street Address / House No / Landmark *
                </label>
                <textarea
                  id="address"
                  rows="3"
                  required
                  placeholder="Enter Your Complete Address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleAddressBlur}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all resize-none"
                />
              </div>

              {/* Map & GPS Section */}
              <div className="relative w-full h-48 bg-surface-dim rounded-lg overflow-hidden border border-outline-variant/30 group shadow-inner">
                <img
                  src={mapImg}
                  alt="Delivery location map"
                  className="w-full h-full object-cover filter contrast-[0.95]"
                />

                <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center p-4">
                  <button
                    type="button"
                    disabled={isDetecting}
                    onClick={handleDetectLocation}
                    className="bg-primary text-on-primary px-5 py-3 rounded-full font-label text-label-md shadow-lg hover:bg-secondary transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-tertiary-fixed" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-5 h-5 text-tertiary-fixed" />
                        <span>Detect My Current Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Location detection status text */}
              {locationStatus && (
                <div className={`text-xs font-label px-3 py-2 rounded-lg flex items-center gap-2 border ${isOutsideServiceZone ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-surface-container-high text-secondary border-outline-variant/30'}`}>
                  {isOutsideServiceZone ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  <span className="truncate">{locationStatus}</span>
                </div>
              )}
            </div>
          </section>

          {/* STEP 3: Payment Method */}
          <section className="bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-on-primary">
                  3
                </div>
                Payment Options
              </h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg ${isOutsideServiceZone ? 'border-outline-variant/50 bg-surface opacity-60 cursor-not-allowed' : 'border-secondary bg-secondary/5 cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="payment"
                    disabled={isOutsideServiceZone}
                    checked={formData.paymentMethod === 'cod' && !isOutsideServiceZone}
                    onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                    className="text-secondary focus:ring-secondary accent-secondary w-4 h-4"
                  />
                  <div>
                    <span className="font-body text-body-md text-on-surface font-bold block">
                      Cash on Delivery (COD) {isOutsideServiceZone && '(Local delivery zone only)'}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {isOutsideServiceZone
                        ? `Available only within ${maxServiceRadius}km of our shop. Out-of-town orders are fulfilled via Courier.`
                        : 'Pay easily with Cash or UPI upon receiving your local delivery.'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-lg bg-surface cursor-not-allowed opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    disabled
                    className="text-secondary focus:ring-secondary w-4 h-4"
                  />
                  <div>
                    <span className="font-body text-body-md text-on-surface-variant font-semibold block">
                      Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Coming Soon
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Order Review Sidebar */}
        <div className="lg:col-span-4 sticky top-28">
          <section className="bg-surface-container rounded-xl p-6 shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] flex flex-col h-full">
            <h2 className="font-headline text-headline-sm text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Receipt className="w-5 h-5 text-secondary" />
              Order Summary
            </h2>

            {/* Order Items */}
            <div className="flex flex-col gap-4 mb-6 flex-grow">
              {items.length === 0 ? (
                <p className="text-on-surface-variant font-body text-body-md">No items in cart.</p>
              ) : (
                items.map((item) => {
                  const img = productImages[item.id] || item.image
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-surface-dim overflow-hidden flex-shrink-0">
                        {img && <img src={img} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-body text-body-md text-on-surface font-semibold line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="font-label text-label-md text-on-surface-variant">
                          Qty: {item.quantity} ({item.weight})
                        </p>
                      </div>
                      <div className="font-body text-body-md text-primary font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-outline-variant/30 pt-4 flex flex-col gap-2 mb-6">
              <div className="flex justify-between items-center font-body text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {calculatedDistance !== null && (
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Delivery Distance</span>
                  <span className={`font-semibold ${isOutsideServiceZone ? 'text-amber-700' : isFreeDistanceZone ? 'text-emerald-700' : 'text-primary'}`}>
                    {calculatedDistance} km ({isOutsideServiceZone ? 'Outside Service Zone' : isFreeDistanceZone ? 'Free Zone' : 'Standard Zone'})
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center font-body text-body-md text-on-surface-variant">
                <span>Delivery</span>
                {isOutsideServiceZone ? (
                  <span className="font-label text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Courier Rate via WhatsApp
                  </span>
                ) : effectiveDeliveryFee === 0 ? (
                  <span className="font-label text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    FREE Delivery
                  </span>
                ) : (
                  <span className="font-semibold text-primary">
                    {formatPrice(effectiveDeliveryFee)}
                  </span>
                )}
              </div>

              {amountNeededForFreeDelivery > 0 && !isFreeDistanceZone && !isOutsideServiceZone && (
                <p className="text-[11px] text-on-surface-variant text-right">
                  Add <strong>{formatPrice(amountNeededForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong>
                </p>
              )}

              <div className="flex justify-between items-center font-headline text-headline-sm text-primary mt-2 pt-2 border-t border-outline-variant/30">
                <span>Total</span>
                <span>{formatPrice(isOutsideServiceZone ? subtotal : effectiveTotal)}</span>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 text-xs font-label text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Action Button */}
            {isOutsideServiceZone ? (
              <button
                type="button"
                onClick={handleWhatsAppCourierOrder}
                disabled={items.length === 0}
                className="w-full text-white font-label text-label-md py-4 rounded-full shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer bg-[#25D366]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Order on WhatsApp (Courier Shipping)</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={items.length === 0 || isSubmitting}
                className="w-full text-on-primary font-label text-label-md py-4 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed font-bold cursor-pointer bg-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (COD)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            <p className="font-label text-[12px] text-center text-on-surface-variant mt-4 flex justify-center items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              {isOutsideServiceZone ? 'Safe Courier Dispatch' : 'Secure Cash on Delivery Checkout'}
            </p>
          </section>
        </div>
      </form>
    </div>
  )
}
