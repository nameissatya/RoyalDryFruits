import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, X, Package, MessageSquare, ChevronRight, LogIn, LogOut } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { fetchProductsApi } from '../../services/productApi'
import MyOrdersModal from '../orders/MyOrdersModal'
import { getWhatsAppLink } from '../../config/storeConfig'

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/collections' },
  { label: 'Gifting', href: '/gifting' },
]

export default function Header() {
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const { user, isLoggedIn, logout, openAuthModal } = useAuth()
  const navigate = useNavigate()

  const [liveProducts, setLiveProducts] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function load() {
      const prods = await fetchProductsApi()
      if (isMounted) {
        setLiveProducts(prods || [])
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const filteredResults = searchQuery.trim()
    ? liveProducts.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : liveProducts.slice(0, 6)

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(`/product/${product.slug || product.id}`)
  }

  return (
    <>
      <header className="w-full top-0 sticky z-50 bg-background border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-margin-desktop max-w-container-max mx-auto">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="text-headline-sm md:text-headline-md font-headline font-bold text-primary tracking-tight"
            >
              Royal Dry Fruits
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-8 mx-auto">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`font-label text-label-md transition-colors duration-200 ${isActive(link.href)
                    ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
                    : 'text-on-surface-variant font-semibold hover:text-secondary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 text-primary shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="p-2 rounded-full hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <Search className="w-6 h-6" />
            </button>
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="p-2 rounded-full hover:bg-surface-variant transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-secondary text-on-secondary text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile Menu Popover */}
            <div className="relative">
              <button
                type="button"
                aria-label="Profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-full hover:bg-surface-variant transition-colors cursor-pointer flex items-center gap-1"
              >
                <User className="w-6 h-6" />
                {isLoggedIn && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 p-4 z-50 animate-fadeIn">
                    {/* Header User Info */}
                    <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20 mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-headline text-body-md font-bold text-primary">
                          {user?.name || 'My Account'}
                        </p>
                        <p className="font-body text-body-xs text-on-surface-variant truncate max-w-[170px]">
                          {user?.phone || 'Royal Dry Fruits Customer'}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {!isLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            openAuthModal()
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-body font-bold transition-all cursor-pointer mb-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <LogIn className="w-4 h-4" />
                            <span>Login with Phone</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            navigate('/my-orders')
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-high text-on-surface text-xs font-body transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 font-semibold">
                            <Package className="w-4 h-4 text-secondary" />
                            <span>My Orders</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      )}

                      <a
                        href={getWhatsAppLink('Hi Royal Dry Fruits, I have a question')}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-800 text-xs font-body transition-colors"
                      >
                        <div className="flex items-center gap-2.5 font-semibold">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp Support</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      </a>

                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 text-red-700 text-xs font-body transition-colors cursor-pointer border-t border-outline-variant/20 mt-2"
                        >
                          <div className="flex items-center gap-2.5 font-semibold">
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* My Orders Modal */}
      <MyOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-fadeIn">
            {/* Input Bar */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3">
              <Search className="w-6 h-6 text-primary" />
              <input
                type="text"
                autoFocus
                placeholder="Search almonds, cashews, dates, gift hampers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-body text-body-lg text-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant px-2 block mb-2">
                {searchQuery ? 'Search Results' : 'Popular Suggestions'}
              </span>
              {filteredResults.length === 0 ? (
                <p className="text-on-surface-variant text-center py-6 font-body">No products found matching "{searchQuery}".</p>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-headline text-label-md text-primary font-bold">{item.name}</h4>
                        <span className="text-xs text-on-surface-variant">{item.category}</span>
                      </div>
                    </div>
                    <span className="font-headline text-label-md text-primary font-bold">{formatPrice(item.price)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
