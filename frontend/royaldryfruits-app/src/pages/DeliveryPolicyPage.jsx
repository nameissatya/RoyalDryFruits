import { Link } from 'react-router-dom'
import { ArrowLeft, Truck, Clock, ShieldCheck, MapPin, CheckCircle, Package, Zap, MessageSquare, Phone, Mail } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getWhatsAppLink, formatDisplayPhone, STORE_PHONE, STORE_EMAIL, STORE_ADDRESS, STORE_NAME } from '../config/storeConfig'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function DeliveryPolicyPage() {
  const {
    storeSettings,
    freeDeliveryRadius,
    maxDeliveryRadius,
    freeDeliveryThreshold,
    baseDeliveryCharge,
    minOrderValue,
  } = useCart()

  const freeRadius = freeDeliveryRadius || 10
  const maxRadius = maxDeliveryRadius || 25
  const deliveryCharge = baseDeliveryCharge || 50
  const freeThreshold = freeDeliveryThreshold || 999
  const minOrder = minOrderValue || 200

  const activeStoreName = storeSettings?.storeName || STORE_NAME
  const activeAddress = storeSettings?.address || STORE_ADDRESS
  const activePhone = storeSettings?.phone || STORE_PHONE
  const activeEmail = storeSettings?.email || STORE_EMAIL

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

      {/* Page Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-bold bg-secondary-container/40 text-secondary mb-3">
          <Truck className="w-3.5 h-3.5" />
          Store Delivery & Fulfillment
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Delivery Policy & Zones
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Transparent delivery rules, local dispatch zones, and shipping thresholds configured for {activeStoreName}.
        </p>
      </div>

      {/* Highlights Box */}
      <div className="bg-surface-container rounded-3xl p-6 md:p-10 border border-outline-variant/30 shadow-sm mb-12 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">
              FREE Within {freeRadius}km
            </h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">
              100% Free local delivery for all orders inside {freeRadius}km radius
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">
              {freeThreshold > 0 ? `FREE Above ${formatPrice(freeThreshold)}` : 'COD Available'}
            </h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">
              Standard {formatPrice(deliveryCharge)} fee between {freeRadius}km and {maxRadius}km
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">
              India-Wide Courier
            </h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">
              Orders beyond {maxRadius}km dispatched safely via Speed Post / Courier
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 max-w-4xl mx-auto font-body text-body-md text-on-surface-variant">
        {/* Section 1: Local Delivery Zones */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            1. Delivery Zones & Distance Calculations
          </h2>
          <p className="leading-relaxed">
            Our central store and dispatch center at <strong className="text-primary">{activeAddress}</strong> calculates your live delivery distance to ensure fast, fresh fulfillment:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="font-label text-xs font-bold text-emerald-800 uppercase block mb-1">Zone 1: Free Zone</span>
              <p className="font-bold text-primary text-sm">0 – {freeRadius} km</p>
              <p className="text-xs text-emerald-700 mt-1">100% Free Express Local Delivery with Cash on Delivery (COD).</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40">
              <span className="font-label text-xs font-bold text-secondary uppercase block mb-1">Zone 2: Standard Zone</span>
              <p className="font-bold text-primary text-sm">{freeRadius} – {maxRadius} km</p>
              <p className="text-xs text-on-surface-variant mt-1">Flat {formatPrice(deliveryCharge)} delivery fee (FREE on orders above {formatPrice(freeThreshold)}).</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="font-label text-xs font-bold text-amber-800 uppercase block mb-1">Zone 3: Out of Town</span>
              <p className="font-bold text-primary text-sm">Beyond {maxRadius} km</p>
              <p className="text-xs text-amber-800 mt-1">Dispatched across India via Speed Post & Courier through WhatsApp checkout.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing & Minimum Order */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-secondary" />
            2. Shipping Fees & Order Thresholds
          </h2>
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-2.5 text-sm">
            <div className="flex justify-between font-bold text-primary pb-2 border-b border-outline-variant/20">
              <span>Local Free Delivery Zone (&le; {freeRadius} km):</span>
              <span className="text-emerald-700 font-bold">₹0 (FREE Delivery)</span>
            </div>
            {freeThreshold > 0 && (
              <div className="flex justify-between text-primary font-semibold pb-2 border-b border-outline-variant/20">
                <span>Order Total Above {formatPrice(freeThreshold)}:</span>
                <span className="text-emerald-700 font-bold">FREE Delivery</span>
              </div>
            )}
            <div className="flex justify-between text-on-surface-variant pb-2 border-b border-outline-variant/20">
              <span>Standard Local Delivery Fee ({freeRadius}km &ndash; {maxRadius}km):</span>
              <span className="font-bold text-primary">{formatPrice(deliveryCharge)}</span>
            </div>
            {minOrder > 0 && (
              <div className="flex justify-between text-on-surface-variant">
                <span>Minimum Cart Value to Place an Order:</span>
                <span className="font-bold text-primary">{formatPrice(minOrder)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Operating Hours */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            3. Dispatch & Operating Timings
          </h2>
          <p className="leading-relaxed">
            Local orders placed between <strong className="text-primary">8:00 AM and 8:00 PM</strong> are packed from temperature-controlled storage and dispatched swiftly.
          </p>
          <p className="leading-relaxed text-sm">
            Orders received after 8:00 PM will be scheduled for priority morning dispatch starting at 8:30 AM the next day.
          </p>
        </section>

        {/* Section 4: Quality & Customer Support */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            4. Freshness Guarantee & Direct Support
          </h2>
          <p className="leading-relaxed">
            Every order is vacuum-sealed and inspected for freshness. If you have any delivery queries or special bulk delivery instructions, contact our store directly:
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <a
              href={`tel:${activePhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-outline-variant/40 text-primary font-bold text-xs hover:border-secondary transition-colors"
            >
              <Phone className="w-4 h-4 text-secondary" />
              {formatDisplayPhone(activePhone)}
            </a>
            <a
              href={getWhatsAppLink(`Hi ${activeStoreName}, I have a question regarding delivery`, activePhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              WhatsApp Support
            </a>
            <a
              href={`mailto:${activeEmail}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-outline-variant/40 text-primary font-bold text-xs hover:border-secondary transition-colors"
            >
              <Mail className="w-4 h-4 text-secondary" />
              {activeEmail}
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
