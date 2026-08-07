import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { fetchProductsApi } from '../../services/productApi'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function BestsellingHampers() {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [toastMessage, setToastMessage] = useState('')
  const [hampersList, setHampersList] = useState([])

  useEffect(() => {
    let isMounted = true
    async function loadHampers() {
      const prods = await fetchProductsApi()
      if (isMounted) {
        const filtered = prods.filter(p => p.category === 'Gift Hampers')
        setHampersList(filtered)
      }
    }
    loadHampers()
    return () => { isMounted = false }
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 344
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleAddToCart = (hamper) => {
    addItem({
      id: hamper.id,
      name: hamper.name,
      weight: '1 Box',
      price: hamper.price,
      quantity: 1,
      image: hamper.image,
    })
    setToastMessage(`${hamper.name} added to cart!`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-on-primary px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
          <span className="font-label text-label-md">{toastMessage}</span>
          <Link to="/cart" className="underline font-bold ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-headline text-headline-md text-primary mb-1">
            Bestselling Hampers
          </h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Artisanal gift hampers curated for special celebrations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hampersList.map((hamper) => (
          <div
            key={hamper.id}
            className="min-w-[300px] md:min-w-[350px] bg-surface rounded-2xl overflow-hidden shadow-[0_8px_24px_0_rgba(48,24,0,0.06)] hover:shadow-[0_16px_36px_0_rgba(48,24,0,0.12)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between flex-shrink-0"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-surface-variant overflow-hidden p-4">
              <img
                src={hamper.image}
                alt={hamper.name}
                className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label text-xs font-semibold shadow-sm">
                {hamper.badge}
              </span>
              <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <span className="font-headline text-label-md text-primary font-bold">
                  {formatPrice(hamper.price)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="font-headline text-headline-sm text-primary mb-1">
                  {hamper.name}
                </h3>
                <p className="font-body text-body-md text-on-surface-variant text-sm mb-4">
                  {hamper.description}
                </p>
              </div>

              {/* Price display & Action Buttons */}
              <div className="mt-auto pt-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-on-surface-variant line-through mr-2">
                      {formatPrice(hamper.originalPrice)}
                    </span>
                    <span className="font-headline text-headline-md text-primary font-bold">
                      {formatPrice(hamper.price)}
                    </span>
                  </div>
                  <span className="text-xs font-label text-secondary font-semibold bg-secondary/10 px-2.5 py-1 rounded-full">
                    Free Delivery
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/gifting')}
                    className="py-3 px-4 bg-surface-container-high text-primary font-label text-label-md rounded-full hover:bg-surface-variant transition-colors text-center font-bold text-xs md:text-sm"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(hamper)}
                    className="py-3 px-4 bg-primary text-on-primary font-label text-label-md rounded-full hover:bg-secondary transition-colors text-center font-bold text-xs md:text-sm flex items-center justify-center gap-1 shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
