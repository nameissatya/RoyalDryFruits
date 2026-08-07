import { Link } from 'react-router-dom'
import { ArrowLeft, Scale, CheckCircle2, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react'

export default function TermsOfServicePage() {
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
          <Scale className="w-3.5 h-3.5" />
          Store Agreement
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Terms of Service
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Effective date: August 8, 2026 • Terms governing purchase, quality guarantees, and store interactions at Royal Dry Fruits.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto font-body text-body-md text-on-surface-variant">
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-secondary" />
            1. Orders, Pricing & Product Availability
          </h2>
          <p className="leading-relaxed">
            By placing an order on Royal Dry Fruits, you agree to provide true and accurate customer details. Prices listed for Almonds, Cashews, Pistachios, Dates, and Hampers are inclusive of applicable taxes. We reserve the right to modify prices or cancel orders in cases of stock unavailability.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            2. Freshness & Quality Guarantee Policy
          </h2>
          <p className="leading-relaxed">
            All our dry fruits are 100% natural, Grade-A quality, sourced from California, Afghanistan, and Middle East orchards. We guarantee zero artificial preservatives or stale products.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Replacement Guarantee
            </p>
            <p>If you receive a package that is damaged, open, or fails our freshness standard, notify us within 24 hours for a 100% free replacement or full refund.</p>
          </div>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-secondary" />
            3. Payment Terms & Cash on Delivery (COD)
          </h2>
          <p className="leading-relaxed">
            We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), and Credit/Debit Cards. For COD orders, payment must be handed over to our rider upon delivery.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-secondary" />
            4. Cancellations & Modifications
          </h2>
          <p className="leading-relaxed">
            Orders can be cancelled before rider dispatch at zero charge. Once dispatched, store management reserves the right to evaluate cancellation requests on a case-by-case basis.
          </p>
        </section>
      </div>
    </div>
  )
}
