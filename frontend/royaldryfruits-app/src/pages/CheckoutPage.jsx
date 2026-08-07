import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, Info, LocateFixed, CreditCard, Receipt, ArrowRight, Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrderApi } from '../services/orderApi'
import mapImg from '../assets/images/checkout-map.jpg'
import almondsImg from '../assets/images/cat-almonds.jpg'
import cashewsImg from '../assets/images/cat-cashews.jpg'

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

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const { user, isLoggedIn, loginWithPhone } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
  })

  const [isDetecting, setIsDetecting] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Checkout OTP Modal State
  const [isCheckoutOtpOpen, setIsCheckoutOtpOpen] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || user.rawPhone || '',
      }))
    }
  }, [user])

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
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (res.ok) {
            const data = await res.json()
            const detectedAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setFormData((prev) => ({ ...prev, address: detectedAddress }))
            setLocationStatus(`📍 Detected: ${detectedAddress}`)
          } else {
            const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setFormData((prev) => ({ ...prev, address: fallbackAddr }))
            setLocationStatus(`📍 Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          }
        } catch {
          const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setFormData((prev) => ({ ...prev, address: fallbackAddr }))
          setLocationStatus(`📍 Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
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

  const executeOrderPlacement = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    const currentTotal = total

    // Silent login customer with their phone number & name
    loginWithPhone(formData.phone, formData.fullName)

    try {
      // POST order to backend PostgreSQL database
      const createdOrder = await createOrderApi({
        customerName: formData.fullName,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        deliveryCharge: deliveryFee,
        items: items,
      })

      // Save order locally for instant My Orders access
      const localOrderObj = {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber || createdOrder.id,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
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
        customerName: formData.fullName,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone) {
      setSubmitError('Please fill in your name and phone number.')
      return
    }
    if (items.length === 0) {
      setSubmitError('Your cart is empty.')
      return
    }

    // Check if user is already verified & logged in on this phone number
    const cleanCurrent = formData.phone.replace(/\D/g, '')
    const cleanUser = (user?.phone || user?.rawPhone || '').replace(/\D/g, '')

    if (isLoggedIn && cleanUser && cleanUser === cleanCurrent) {
      // User is already verified & logged in! Place order immediately.
      await executeOrderPlacement()
    } else {
      // User needs OTP verification! Generate OTP and open modal.
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      setGeneratedOtp(otp)
      setEnteredOtp('')
      setOtpError('')
      setIsCheckoutOtpOpen(true)
    }
  }

  const handleVerifyCheckoutOtp = async (e) => {
    e.preventDefault()
    if (enteredOtp.trim() === generatedOtp) {
      setIsCheckoutOtpOpen(false)
      await executeOrderPlacement()
    } else {
      setOtpError('Incorrect OTP code. Please check and try again.')
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">
          Checkout
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Complete your order securely.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Forms and Map */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Contact Information */}
          <section className="bg-surface-container rounded-xl p-6 shadow-[0_4px_20px_0_rgba(48,24,0,0.06)]">
            <h2 className="font-headline text-headline-sm text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <User className="w-5 h-5 text-secondary" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface-variant" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-surface border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface-variant" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-surface border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                />
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-surface-container rounded-xl p-6 shadow-[0_4px_20px_0_rgba(48,24,0,0.06)]">
            <h2 className="font-headline text-headline-sm text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <MapPin className="w-5 h-5 text-secondary" />
              Delivery Details
            </h2>
            <div className="mb-6">
              <div className="flex items-start gap-3 bg-secondary-container/20 p-4 rounded-lg border border-secondary-container/30">
                <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="font-body text-body-md text-on-surface-variant">
                  <span className="font-semibold text-secondary">COD available only within 10km of our store.</span> Please pin your exact location below for accurate delivery.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface-variant" htmlFor="address">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="123 Main St, Apartment 4B"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-surface border border-outline-variant/50 rounded-lg px-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                />
              </div>
              {/* Map Section */}
              <div className="relative w-full h-64 bg-surface-dim rounded-lg overflow-hidden border border-outline-variant/30 group shadow-inner">
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
                <div className="text-xs font-label text-secondary bg-surface-container-high px-3 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{locationStatus}</span>
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-surface-container rounded-xl p-6 shadow-[0_4px_20px_0_rgba(48,24,0,0.06)]">
            <h2 className="font-headline text-headline-sm text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <CreditCard className="w-5 h-5 text-secondary" />
              Payment
            </h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-4 border border-secondary rounded-lg bg-secondary/5 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                  className="text-secondary focus:ring-secondary accent-secondary"
                />
                <span className="font-body text-body-md text-on-surface font-semibold">
                  Cash on Delivery (COD)
                </span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-lg bg-surface cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="payment"
                  disabled
                  className="text-secondary focus:ring-secondary"
                />
                <span className="font-body text-body-md text-on-surface-variant">
                  Online Payment (Coming Soon)
                </span>
              </label>
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
              <div className="flex justify-between items-center font-body text-body-md text-on-surface-variant">
                <span>Delivery</span>
                <span className="text-tertiary-container font-semibold">Free (Within 10km)</span>
              </div>
              <div className="flex justify-between items-center font-headline text-headline-sm text-primary mt-2 pt-2 border-t border-outline-variant/30">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order Action */}
            {submitError && (
              <div className="mb-4 text-xs font-label text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={items.length === 0 || isSubmitting}
              className="w-full bg-primary text-on-primary font-label text-label-md py-4 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-tertiary-fixed" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="font-label text-[12px] text-center text-on-surface-variant mt-4 flex justify-center items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Secure Checkout
            </p>
          </section>
        </div>
      </form>

      {/* Checkout OTP Verification Modal */}
      {isCheckoutOtpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl border border-outline-variant/30 relative">
            <button
              onClick={() => setIsCheckoutOtpOpen(false)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container/40 text-secondary mx-auto mb-3 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-headline-sm text-primary font-bold">
                Verify Mobile to Confirm Order
              </h3>
              <p className="font-body text-body-xs text-on-surface-variant mt-1">
                Enter 4-digit OTP sent to <strong className="text-primary">+91 {formData.phone.replace(/\D/g, '').slice(-10)}</strong>
              </p>
            </div>

            {/* Demo OTP Banner */}
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-center text-xs font-body">
              🔒 <span className="font-bold">Checkout OTP Code:</span>{' '}
              <span className="text-sm font-bold text-emerald-700 tracking-widest bg-emerald-100 px-2 rounded ml-1">
                {generatedOtp}
              </span>
            </div>

            <form onSubmit={handleVerifyCheckoutOtp} className="space-y-4">
              <div>
                <label className="block font-label text-label-sm text-on-surface-variant mb-1 text-center">
                  Enter 4-Digit Security Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] bg-surface-container border border-outline-variant rounded-xl py-3.5 text-primary outline-none focus:border-secondary"
                />
              </div>

              {otpError && (
                <p className="text-xs text-red-600 font-semibold text-center bg-red-50 p-2 rounded-lg border border-red-200">
                  {otpError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-label text-label-md font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Verify OTP & Place Order</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
