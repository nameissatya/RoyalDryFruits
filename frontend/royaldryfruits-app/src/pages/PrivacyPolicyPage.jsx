import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react'
import { STORE_EMAIL, STORE_NAME } from '../config/storeConfig'

export default function PrivacyPolicyPage() {
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
          <Shield className="w-3.5 h-3.5" />
          Data Security & Protection
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Privacy Policy
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          How {STORE_NAME} collects, handles, and protects your personal customer details.
        </p>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-8 max-w-4xl mx-auto font-body text-body-md text-on-surface-variant">
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-secondary" />
            1. Information We Collect
          </h2>
          <p className="leading-relaxed">
            When placing an order or registering, we collect only essential fulfillment data: your full name, 10-digit mobile number for OTP login & dispatch updates, delivery address, and order items.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-secondary" />
            2. How We Use Your Data
          </h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Accurate doorstep dispatch and GPS distance validation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Order confirmation and status notifications via SMS/WhatsApp</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We never sell, rent, or trade your personal information to third parties</span>
            </li>
          </ul>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            3. Data Storage & Security
          </h2>
          <p className="leading-relaxed">
            We store order records securely in encrypted PostgreSQL databases. Payment transactions are processed through RBI-compliant secure gateways. Cash on Delivery records are kept confidential.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            4. Your Rights & Contact
          </h2>
          <p className="leading-relaxed">
            You have the right to request access to your stored order history or ask for complete erasure of your customer profile. To request assistance, contact our team at <strong className="text-primary">{STORE_EMAIL}</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
