import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Truck, Store } from 'lucide-react'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OrderSuccessPage() {
  const location = useLocation()
  const orderDetails = location.state || {
    orderId: '#RDF-' + Math.floor(10000 + Math.random() * 90000),
    totalAmount: 1720,
  }

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
      <div className="max-w-2xl mx-auto bg-surface-container rounded-xl p-8 md:p-12 shadow-[0_8px_30px_rgb(48,24,0,0.06)] border border-outline-variant/30 text-center relative overflow-hidden">
        {/* Celebration Background Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-fixed/50 via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-tertiary-fixed/40 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-tertiary-fixed/30 rounded-full flex items-center justify-center mb-8 shadow-sm">
            <CheckCircle2 className="w-14 h-14 text-tertiary-container" />
          </div>

          {/* Main Message */}
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-4">
            Thank You for Your Order!
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto">
            Your premium dry fruits are being carefully packed. We appreciate your choice of quality and wellness.
          </p>

          {/* Order Details Card */}
          <div className="w-full bg-surface-container-high rounded-lg p-6 mb-8 border border-outline-variant/20 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b border-outline-variant/20">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-label text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Order ID
                </span>
                <span className="font-headline text-headline-sm text-primary font-bold">
                  {orderDetails.orderId}
                </span>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <span className="font-label text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Total Amount
                </span>
                <span className="font-headline text-headline-sm text-primary font-bold">
                  {formatPrice(orderDetails.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-surface rounded p-4 border border-outline-variant/10">
              <Truck className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-label text-label-md text-primary mb-1 font-semibold">
                  Delivery Status
                </h3>
                <p className="font-body text-body-md text-secondary font-medium">
                  Estimated delivery within 2 hours
                </p>
                <p className="font-body text-body-md text-on-surface-variant text-sm mt-1">
                  We'll notify you when your rider is on the way.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/collections"
              className="bg-primary hover:bg-secondary text-on-primary font-label text-label-md py-4 px-8 rounded-full transition-all shadow-sm active:scale-95 duration-150 flex items-center justify-center gap-2 font-bold"
            >
              <Store className="w-5 h-5" />
              Continue Shopping
            </Link>
            <Link
              to="/my-orders"
              className="bg-transparent border-2 border-primary text-primary hover:bg-surface-variant font-label text-label-md py-4 px-8 rounded-full transition-all active:scale-95 duration-150 font-bold flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5" />
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
