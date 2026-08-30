import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Phone, Navigation, Sparkles, ShieldCheck, ShoppingBag } from 'lucide-react'
import WhatsAppIcon from '../components/common/WhatsAppIcon'
import { useCart } from '../context/CartContext'
import { getWhatsAppLink, formatDisplayPhone, STORE_PHONE, STORE_EMAIL, STORE_ADDRESS, STORE_NAME } from '../config/storeConfig'
import mapImg from '../assets/images/checkout-map.jpg'

export default function StoreLocationPage() {
  const { storeSettings, freeDeliveryRadius } = useCart()
  const activePhone = storeSettings?.phone || STORE_PHONE
  const activeEmail = storeSettings?.email || STORE_EMAIL
  const activeAddress = storeSettings?.address || STORE_ADDRESS
  const activeStoreName = storeSettings?.storeName || STORE_NAME
  const activeRadius = freeDeliveryRadius || 10

  const lat = storeSettings?.latitude
  const lng = storeSettings?.longitude
  const mapsUrl = lat && lng 
    ? `https://maps.google.com/?q=${lat},${lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(activeAddress)}`

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
          <MapPin className="w-3.5 h-3.5" />
          Royal Experience Store
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Visit Our Store
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Experience our full collection of premium dry fruits, artisanal gift hampers, and gourmet selections in person at {activeStoreName}.
        </p>
      </div>

      {/* Store Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Address Card */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-headline-sm text-primary font-bold mb-2">
              Store Address
            </h3>
            <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-4">
              {activeAddress}
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-label text-label-md text-secondary font-bold hover:underline"
          >
            <Navigation className="w-4 h-4" />
            Get Directions →
          </a>
        </div>

        {/* Operating Hours Card */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-headline-sm text-primary font-bold mb-2">
              Opening Hours
            </h3>
            <div className="space-y-2 text-on-surface-variant font-body text-body-md">
              <div className="flex justify-between">
                <span>Monday – Saturday:</span>
                <span className="font-semibold text-primary">8:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-semibold text-primary">8:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-700 font-label text-xs font-bold bg-emerald-50 py-1.5 px-3 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Open 7 Days a Week
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-headline-sm text-primary font-bold mb-2">
              Store Support
            </h3>
            <p className="font-body text-body-md text-on-surface-variant mb-4">
              Call us directly or chat on WhatsApp for bulk order inquiries, corporate gifts, and custom hampers.
            </p>
            <a href={`tel:${activePhone}`} className="font-headline text-headline-sm text-secondary font-bold mb-1 hover:underline block">
              {formatDisplayPhone(activePhone)}
            </a>
            <p className="font-body text-body-xs text-on-surface-variant">
              Email: {activeEmail}
            </p>
          </div>

          <a
            href={getWhatsAppLink(`Hi ${activeStoreName}, I want to visit your store`, activePhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-label text-label-md font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Map Banner Section */}
      <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/30 shadow-md relative mb-12">
        <div className="h-80 w-full relative">
          <img src={mapImg} alt="Store Map Location" className="w-full h-full object-cover filter contrast-[1.05]" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex items-end p-8">
            <div className="text-on-primary">
              <span className="font-label text-xs uppercase tracking-widest font-bold text-secondary-fixed">{activeStoreName}</span>
              <h2 className="font-display text-display-md text-white font-bold mb-1">{activeStoreName} Experience Store</h2>
              <p className="font-body text-body-md text-white/90">Equipped with 100% Temperature-Controlled Freshness Vault</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Free Tasting Counter', desc: 'Sample raw, roasted, and flavored dry fruits before buying', icon: Sparkles },
          { title: 'Custom Hampers Desk', desc: 'Personalized gift packaging for weddings & corporate events', icon: ShoppingBag },
          { title: 'Cold Storage Vault', desc: 'Preserves natural oils, crispness, and zero preservatives', icon: ShieldCheck },
          { title: `${activeRadius}km Express Hub`, desc: `Direct dispatch center for fast neighborhood deliveries within ${activeRadius}km`, icon: Navigation },
        ].map((feat, idx) => {
          const IconComponent = feat.icon
          return (
            <div key={idx} className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/20">
              <IconComponent className="w-6 h-6 text-secondary mb-2" />
              <h4 className="font-headline text-body-md font-bold text-primary mb-1">{feat.title}</h4>
              <p className="font-body text-body-xs text-on-surface-variant">{feat.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
