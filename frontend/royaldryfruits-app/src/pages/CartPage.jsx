import { Link } from 'react-router-dom'
import { Image as ImageIcon, Minus, Plus, Trash2, ArrowRight, CheckCircle2, Truck, ShoppingCart } from 'lucide-react'
import WhatsAppIcon from '../components/common/WhatsAppIcon'
import { useCart } from '../context/CartContext'
import { getWhatsAppLink, STORE_WHATSAPP } from '../config/storeConfig'
import almondsImg from '../assets/images/cat-almonds.jpg'
import cashewsImg from '../assets/images/cat-cashews.jpg'

// Map product IDs to local images
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

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart()
  const image = item.image || productImages[item.id]

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6 border-b border-outline-variant/20">
      {/* Product Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-headline text-headline-sm text-primary mb-1">
            {item.name}
          </h3>
          <p className="font-body text-body-md text-on-surface-variant">
            Weight: {item.weight}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1 mt-4">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-label text-label-md text-primary tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price & Remove */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-4">
          <span className="font-headline text-headline-sm text-primary font-bold">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={() => removeItem(item.id)}
            className="flex items-center gap-1 text-on-surface-variant hover:text-error font-label text-label-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderSummary() {
  const { items, subtotal, deliveryFee, total, isFreeDelivery, freeDeliveryThreshold, amountNeededForFreeDelivery, minOrderValue, storeSettings } = useCart()

  const handleWhatsAppOrder = () => {
    let text = 'Hello Royal Dry Fruits! I would like to place an order:\n\n'
    items.forEach(item => {
      text += `• ${item.quantity}x ${item.name} (${item.weight}) - ₹${item.price * item.quantity}\n`
    })
    
    text += `\nSubtotal: ₹${subtotal}`
    if (deliveryFee === 0) {
      text += `\nDelivery: Free (Local)`
    } else {
      text += `\nDelivery: ₹${deliveryFee}`
    }
    text += `\n*Total Amount: ₹${total}*\n\nPlease confirm my order and let me know the payment options.`

    const link = getWhatsAppLink(text, storeSettings?.phone || STORE_WHATSAPP)
    window.open(link, '_blank')
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-6 lg:p-8 h-fit sticky top-24">
      <h2 className="font-headline text-headline-sm text-primary mb-6 pb-4 border-b border-outline-variant/20">
        Order Summary
      </h2>

      {/* Free Delivery Progress Banner */}
      {freeDeliveryThreshold > 0 && (
        <div className="mb-6 p-3 rounded-lg border text-xs">
          {isFreeDelivery ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/50 p-2 rounded">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">🎉 You unlocked FREE Delivery!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-on-surface-variant">
                <span>Add <strong>{formatPrice(amountNeededForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong></span>
                <span className="font-semibold">{Math.round((subtotal / freeDeliveryThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimum order notice */}
      {minOrderValue > 0 && subtotal < minOrderValue && (
        <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <span>⚠️ Minimum order value is <strong>{formatPrice(minOrderValue)}</strong></span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-body text-body-md text-on-surface-variant">
            Subtotal
          </span>
          <span className="font-label text-label-md text-primary font-semibold">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-body-md text-on-surface-variant">
            Delivery Fee
          </span>
          {deliveryFee === 0 ? (
            <span className="font-label text-label-md text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              FREE
            </span>
          ) : (
            <span className="font-label text-label-md text-primary font-semibold">
              {formatPrice(deliveryFee)}
            </span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/20 mb-2">
        <span className="font-headline text-headline-sm text-primary">
          Total
        </span>
        <div className="text-right">
          <span className="font-headline text-headline-md text-primary font-bold">
            {formatPrice(total)}
          </span>
        </div>
      </div>
      <p className="text-right font-body text-[13px] text-on-surface-variant mb-6 italic">
        Inclusive of all taxes
      </p>

      {/* Checkout Buttons */}
      <div className="flex flex-col gap-3">
        <Link
          to="/checkout"
          className="w-full py-4 bg-primary text-on-primary font-label text-label-md rounded-full hover:bg-secondary transition-all duration-300 shadow-[0_4px_20px_0_rgba(48,24,0,0.15)] hover:shadow-[0_8px_25px_0_rgba(48,24,0,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold"
        >
          Proceed to Checkout
          <ArrowRight className="w-5 h-5" />
        </Link>
        
        <button
          onClick={handleWhatsAppOrder}
          className="w-full py-4 bg-[#25D366] text-white font-label text-label-md rounded-full hover:brightness-105 transition-all duration-300 shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Order on WhatsApp
        </button>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-outline-variant/20 space-y-3">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          <span className="font-body text-body-md">
            Premium Quality Guaranteed
          </span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Truck className="w-5 h-5 text-secondary" />
          <span className="font-body text-body-md">Fast Local Delivery</span>
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart className="w-16 h-16 text-outline-variant mb-6" />
      <h2 className="font-headline text-headline-md text-primary mb-3">
        Your cart is empty
      </h2>
      <p className="font-body text-body-md text-on-surface-variant mb-8 max-w-md">
        Looks like you haven't added any items to your cart yet. Explore our
        premium dry fruits collection.
      </p>
      <Link
        to="/collections"
        className="px-8 py-4 bg-primary text-on-primary font-label text-label-md rounded-full hover:bg-secondary transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 font-bold"
      >
        Start Shopping
      </Link>
    </div>
  )
}

export default function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-8">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
