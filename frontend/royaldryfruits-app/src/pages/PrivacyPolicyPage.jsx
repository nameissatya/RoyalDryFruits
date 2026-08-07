import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react'

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
          Last updated: August 8, 2026 • Royal Dry Fruits respects your personal data privacy and maintains strict security controls.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto font-body text-body-md text-on-surface-variant">
        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-secondary" />
            1. Information We Collect
          </h2>
          <p className="leading-relaxed">
            When you place an order or create an account with Royal Dry Fruits, we collect only essential personal details required to process and deliver your order safely:
          </p>
          <ul className="space-y-2 pt-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> <strong>Contact Information:</strong> Name, mobile phone number, and optional email address.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> <strong>Delivery Details:</strong> Street address, landmark, pincode, and GPS coordinates (if location detection is authorized).</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> <strong>Order History:</strong> Purchased items, preferred weight variants, and order timestamps.</li>
          </ul>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-secondary" />
            2. How We Use Your Data
          </h2>
          <p className="leading-relaxed">
            Your information is used strictly to fulfill your dry fruit orders, send delivery updates via SMS/WhatsApp, and provide customer support.
          </p>
          <p className="leading-relaxed font-bold text-primary">
            🔒 We NEVER sell, rent, or trade your mobile phone number or personal details to third-party telemarketers or external advertisers.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            3. Data Protection & Security
          </h2>
          <p className="leading-relaxed">
            We store order records securely in encrypted PostgreSQL databases. Payment transactions are processed through RBI-compliant secure gateways. Cash on Delivery records are kept confidential.
          </p>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 space-y-3">
          <h2 className="font-headline text-headline-sm text-primary font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            4. Your Rights & Account Deletion
          </h2>
          <p className="leading-relaxed">
            You have the right to request access to your stored order history or ask for complete erasure of your customer profile. To request data deletion, contact our Privacy Officer at <strong className="text-primary">privacy@royaldryfruits.com</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
