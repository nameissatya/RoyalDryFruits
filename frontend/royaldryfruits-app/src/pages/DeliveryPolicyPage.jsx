import { Link } from 'react-router-dom'
import { ArrowLeft, Truck, Clock, ShieldCheck, MapPin, CheckCircle, Package, Zap } from 'lucide-react'

export default function DeliveryPolicyPage() {
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
          Hyperlocal Cold-Chain Express
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Delivery Policy (10km Radius)
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Learn how Royal Dry Fruits guarantees 2-hour express neighborhood delivery with 100% temperature-controlled freshness.
        </p>
      </div>

      {/* Hero Highlight Box */}
      <div className="bg-surface-container rounded-3xl p-6 md:p-10 border border-outline-variant/30 shadow-sm mb-12 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">2-Hour Express</h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">Guaranteed delivery within 120 minutes inside 10km radius</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">FREE Above ₹1,500</h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">Nominal ₹50 fee for orders under threshold</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-headline text-headline-sm text-primary font-bold">Cold-Chain Packing</h3>
            <p className="font-body text-body-xs text-on-surface-variant mt-1">Preserves natural nut crispness & moisture shield</p>
          </div>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 max-w-4xl mx-auto font-body text-body-md text-on-surface-variant">
        {/* Section 1 */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            1. 10km Hyperlocal Delivery Radius
          </h2>
          <p className="leading-relaxed">
            Our Kondapur store operates as an express dispatch center serving all areas within a <strong className="text-primary">10km driving radius</strong>, including Kondapur, Hitech City, Madhapur, Gachibowli, Jubilee Hills, Kothaguda, Hafeezpet, and Miyapur.
          </p>
          <ul className="space-y-1.5 pt-2 text-xs">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Orders inside 10km radius qualify for 2-Hour Express Delivery.</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Orders outside 10km are dispatched via standard courier (1-2 business days).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            2. Dispatch Cut-Off Timings
          </h2>
          <p className="leading-relaxed">
            Express 2-hour orders placed between <strong className="text-primary">8:00 AM and 8:00 PM</strong> are packed and handed over to our dedicated delivery riders immediately.
          </p>
          <p className="leading-relaxed text-sm">
            Orders received after 8:00 PM will be scheduled for priority morning dispatch starting at 8:30 AM the next day.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-secondary" />
            3. Shipping Charges & Free Threshold
          </h2>
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex justify-between font-bold text-primary text-sm">
              <span>Order Total Above ₹1,500:</span>
              <span className="text-emerald-700">FREE Delivery</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Order Total Under ₹1,500:</span>
              <span>Flat ₹50 Delivery Fee</span>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            4. Freshness Guarantee Upon Delivery
          </h2>
          <p className="leading-relaxed">
            If your order arrives damaged or compromised, our rider will immediately issue a replacement on the spot or process a full refund. Your satisfaction with premium quality is 100% guaranteed.
          </p>
        </section>
      </div>
    </div>
  )
}
