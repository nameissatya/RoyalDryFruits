import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, ShoppingBag, User, MapPin } from 'lucide-react'

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Collections', icon: LayoutGrid, href: '/collections' },
  { label: 'Cart', icon: ShoppingBag, href: '/cart', badge: true },
  { label: 'Store Location', icon: MapPin, href: '/store-location' },
  { label: 'Orders', icon: User, href: '/my-orders' },
]

export default function MobileNav() {
  const { pathname } = useLocation()

  const isActive = (href) => {
    if (href === '/') return pathname === '/' || pathname === '/shop'
    return pathname === href
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 h-16 bg-surface shadow-[0_-4px_20px_0_rgba(48,24,0,0.06)] md:hidden z-50">
      {navItems.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.label}
            to={item.href}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-150 ${
              active
                ? 'text-secondary font-bold'
                : 'text-on-surface-variant active:bg-surface-container-high active:scale-95'
            }`}
          >
            <span className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {item.badge && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-secondary rounded-full" />
              )}
            </span>
            <span className="font-label text-[10px] leading-tight">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
