import { Link } from 'react-router-dom'
import { Banknote, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react'
import WhatsAppIcon from '../common/WhatsAppIcon'
import { useCart } from '../../context/CartContext'
import { getWhatsAppLink } from '../../config/storeConfig'
import heroImg from '../../assets/images/home-hero.jpg'

const trustBadges = [
  { icon: Banknote, label: 'COD Available' },
  { icon: MapPin, label: 'Fast Local Delivery' },
  { icon: CheckCircle2, label: '100% Fresh Stock' },
  { icon: ShieldCheck, label: 'Secure Packaging' },
]

export default function HomeHero() {
  const { freeDeliveryRadius } = useCart()
  const activeRadius = freeDeliveryRadius || 10

  const handleWhatsAppOrder = () => {
    const link = getWhatsAppLink('Hi Royal Dry Fruits! I would like to place an order.')
    window.open(link, '_blank')
  }

  return (
    <section className="relative w-full min-h-[750px] flex items-center justify-center bg-surface-container-high overflow-hidden py-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-80 mix-blend-multiply"
          style={{ backgroundImage: `url('${heroImg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/45 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mt-10 flex flex-col items-center">
        <span className="inline-block py-1 px-3.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-label-md mb-6 uppercase tracking-widest shadow-sm">
          Local Premium Store
        </span>

        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-6 max-w-4xl mx-auto drop-shadow-sm">
          Fresh Dry Fruits Delivered Within {activeRadius}km Free Zone
        </h1>

        <p className="font-body text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
          Experience the finest selection of hand-picked almonds, walnuts, cashews, and artisanal gift hampers, delivered fresh right to your doorstep.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
          <Link
            to="/collections"
            className="px-9 py-4 bg-primary text-on-primary font-label text-label-md rounded-full shadow-[0_8px_30px_rgb(48,24,0,0.15)] hover:-translate-y-1 hover:bg-secondary hover:shadow-[0_12px_40px_rgb(48,24,0,0.25)] transition-all duration-300 w-full sm:w-auto font-bold"
          >
            Shop Now
          </Link>
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="px-8 py-4 bg-[#25D366] text-white font-label text-label-md rounded-full shadow-md hover:brightness-105 transition-all duration-300 w-full sm:w-auto font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Order on WhatsApp
          </button>
        </div>

        {/* Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-surface/80 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-4 md:px-8 md:py-5 shadow-lg w-full max-w-4xl">
          {trustBadges.map((badge) => {
            const Icon = badge.icon
            return (
              <div key={badge.label} className="flex items-center justify-center gap-2.5 text-primary">
                <Icon className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="font-label text-label-md text-primary font-semibold text-xs md:text-sm">
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
