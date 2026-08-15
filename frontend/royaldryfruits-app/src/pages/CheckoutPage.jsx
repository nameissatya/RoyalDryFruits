import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, Info, LocateFixed, CreditCard, Receipt, ArrowRight, Lock, Loader2, CheckCircle2, AlertCircle, Phone, Smartphone, ChevronDown } from 'lucide-react'
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
  const { user, isLoggedIn, sendOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  // Checkout Steps: 1: Phone, 2: OTP, 3: Address, 4: Payment
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    address: '',
    paymentMethod: 'cod',
  })

  const [isDetecting, setIsDetecting] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Auto-fill logged in user info and skip to address step
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || user.rawPhone || prev.phone,
      }))
      if (currentStep < 3) {
        setCurrentStep(3)
      }
    }
  }, [isLoggedIn, user, currentStep])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setSubmitError('Please enter a valid 10-digit Indian phone number.')
      return
    }

    setIsSubmitting(true)
    try {
      await sendOtp(cleanPhone)
      setCurrentStep(2)
    } catch (err) {
      setSubmitError('Failed to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (formData.otp.length !== 4) {
      setSubmitError('Please enter a 4-digit OTP.')
      return
    }

    setIsSubmitting(true)
    const cleanPhone = formData.phone.replace(/\D/g, '')
    try {
      await verifyOtp(cleanPhone, formData.otp)
      setCurrentStep(3)
    } catch (err) {
      setSubmitError('Incorrect OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddressContinue = (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!formData.fullName || !formData.address) {
      setSubmitError('Please enter your full name and delivery address.')
      return
    }
    setCurrentStep(4)
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
    if (items.length === 0) {
      setSubmitError('Your cart is empty.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    const currentTotal = total

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

  // Determine what the sidebar button does based on the current step
  const getSidebarButtonAction = () => {
    if (currentStep === 1) return handleSendOtp
    if (currentStep === 2) return handleVerifyOtp
    if (currentStep === 3) return handleAddressContinue
    if (currentStep === 4) return executeOrderPlacement
    return () => {}
  }

  const getSidebarButtonLabel = () => {
    if (currentStep === 1) return 'Get OTP'
    if (currentStep === 2) return 'Verify & Continue'
    if (currentStep === 3) return 'Proceed to Payment'
    if (currentStep === 4) return 'Place Order'
    return 'Continue'
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">
          Checkout
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Complete your order securely in 4 easy steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Forms and Map */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* STEP 1: Mobile Number */}
          <section className={`bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
            <div 
              className={`p-6 flex items-center justify-between cursor-pointer ${currentStep !== 1 && currentStep > 1 ? 'bg-surface-container-high' : ''}`}
              onClick={() => { if (!isLoggedIn) setCurrentStep(1) }}
            >
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 1 ? 'bg-primary text-on-primary' : currentStep > 1 ? 'bg-secondary text-on-secondary' : 'bg-outline-variant text-on-surface-variant'}`}>
                  {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                </div>
                Mobile Number
              </h2>
              {currentStep > 1 && !isLoggedIn && (
                <span className="text-secondary font-label text-label-sm hover:underline">Edit</span>
              )}
            </div>
            
            {currentStep === 1 && (
              <div className="p-6 pt-0 border-t border-outline-variant/30 mt-4 animate-fadeIn">
                <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-label-md text-on-surface-variant" htmlFor="phone">
                      Enter your mobile number to sign in or create an account
                    </label>
                    <div className="relative flex items-center max-w-md">
                      <span className="absolute left-4 text-on-surface-variant font-bold font-body">+91</span>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-12 pr-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-on-primary font-label text-label-md py-3 px-8 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* STEP 2: OTP */}
          {!isLoggedIn && (
            <section className={`bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
              <div className="p-6 flex items-center justify-between">
                <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 2 ? 'bg-primary text-on-primary' : currentStep > 2 ? 'bg-secondary text-on-secondary' : 'bg-outline-variant text-on-surface-variant'}`}>
                    {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                  </div>
                  OTP Verification
                </h2>
              </div>
              
              {currentStep === 2 && (
                <div className="p-6 pt-0 border-t border-outline-variant/30 mt-4 animate-fadeIn">
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <p className="font-body text-body-sm text-on-surface-variant">
                        Enter the 4-digit code sent to +91 {formData.phone.replace(/\D/g, '').slice(-10)}
                      </p>
                      <input
                        id="otp"
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        placeholder="• • • •"
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full max-w-xs text-center text-2xl font-bold tracking-[0.5em] bg-surface-container border border-outline-variant/50 rounded-xl py-3.5 text-primary outline-none focus:border-secondary transition-all"
                      />
                    </div>
                    
                    <div className="w-full max-w-xs bg-primary/10 border border-primary/20 rounded-lg p-2 text-center text-xs font-medium text-primary">
                      For testing, please use OTP: <strong>1234</strong>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-secondary text-on-secondary font-label text-label-md py-3 px-8 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {/* STEP 3: Address */}
          <section className={`bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
            <div 
              className={`p-6 flex items-center justify-between cursor-pointer ${currentStep > 3 ? 'bg-surface-container-high' : ''}`}
              onClick={() => { if (currentStep > 3) setCurrentStep(3) }}
            >
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 3 ? 'bg-primary text-on-primary' : currentStep > 3 ? 'bg-secondary text-on-secondary' : 'bg-outline-variant text-on-surface-variant'}`}>
                  {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : isLoggedIn ? '2' : '3'}
                </div>
                Delivery Address
              </h2>
              {currentStep > 3 && (
                <span className="text-secondary font-label text-label-sm hover:underline">Edit</span>
              )}
            </div>
            
            {currentStep === 3 && (
              <div className="p-6 pt-0 border-t border-outline-variant/30 mt-4 animate-fadeIn">
                <div className="mb-6 mt-2">
                  <div className="flex items-start gap-3 bg-secondary-container/20 p-4 rounded-lg border border-secondary-container/30">
                    <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-body text-body-md text-on-surface-variant">
                      <span className="font-semibold text-secondary">COD available only within 10km of our store.</span> Please pin your exact location below for accurate delivery.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleAddressContinue} className="flex flex-col gap-6">
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

                  <div>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-label text-label-md py-3 px-8 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-2 font-bold cursor-pointer"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* STEP 4: Payment Method */}
          <section className={`bg-surface-container rounded-xl shadow-[0_4px_20px_0_rgba(48,24,0,0.06)] overflow-hidden transition-all duration-300 ${currentStep === 4 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
            <div className="p-6 flex items-center justify-between">
              <h2 className="font-headline text-headline-sm text-primary flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 4 ? 'bg-primary text-on-primary' : 'bg-outline-variant text-on-surface-variant'}`}>
                  {isLoggedIn ? '3' : '4'}
                </div>
                Payment Options
              </h2>
            </div>
            
            {currentStep === 4 && (
              <div className="p-6 pt-0 border-t border-outline-variant/30 mt-4 animate-fadeIn">
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
              </div>
            )}
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

            {/* Action Button */}
            {submitError && (
              <div className="mb-4 text-xs font-label text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => getSidebarButtonAction()(e)}
              disabled={items.length === 0 || isSubmitting}
              className={`w-full text-on-primary font-label text-label-md py-4 rounded-full shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed font-bold cursor-pointer ${currentStep === 4 ? 'bg-secondary' : 'bg-primary'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{getSidebarButtonLabel()}</span>
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
      </div>
    </div>
  )
}
