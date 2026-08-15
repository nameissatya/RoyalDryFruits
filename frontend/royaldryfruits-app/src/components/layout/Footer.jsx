import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../common/SocialIcons'
import WhatsAppIcon from '../common/WhatsAppIcon'

const exploreLinks = [
  { label: 'Store Location', href: '/store-location' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Delivery Policy (10km Radius)', href: '/delivery-policy' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
]

export default function Footer() {
  return (
    <footer className="w-full pt-16 pb-28 md:pb-16 bg-surface-container border-t border-outline-variant/20">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="font-headline text-headline-sm text-primary mb-4 font-bold">
              Royal Dry Fruits
            </div>
            <p className="text-on-surface-variant font-body text-body-md mb-6 max-w-xs leading-relaxed">
              Premium quality, handcrafted dry fruit selections tailored for
              exceptional gifting experiences.
            </p>
            <div className="font-body text-body-xs text-on-surface-variant mb-6">
              © {new Date().getFullYear()} Royal Dry Fruits. All Rights Reserved.
            </div>
          </div>

          {/* Explore */}
          <div className="col-span-1">
              <h4 className="font-label text-label-md text-primary font-bold mb-4 uppercase tracking-wider">
                Explore
              </h4>
              <ul className="space-y-3 flex flex-col">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-on-surface-variant font-body text-body-md hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          {/* Legal */}
          <div className="col-span-1">
              <h4 className="font-label text-label-md text-primary font-bold mb-4 uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-3 flex flex-col">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-on-surface-variant font-body text-body-md hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          {/* Social Links */}
          <div className="col-span-1 flex flex-col justify-start lg:items-end">
            <h4 className="font-label text-label-md text-primary font-bold mb-4 uppercase tracking-wider hidden lg:block invisible">
              Social
            </h4>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-[#25D366] hover:bg-surface-container-highest transition-colors cursor-pointer"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-[#E1306C] hover:bg-surface-container-highest transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-[#1877F2] hover:bg-surface-container-highest transition-colors cursor-pointer"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-[#FF0000] hover:bg-surface-container-highest transition-colors cursor-pointer"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Made With Love Line */}
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-on-surface-variant">
          <p className="flex items-center gap-1.5 font-semibold text-primary">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse inline" /> in India for Royal Dry Fruits
          </p>
          <p className="text-[11px] text-on-surface-variant/80">
            Handpicked Almonds • Whole Cashews • Medjool Dates • Artisanal Hampers
          </p>
        </div>
      </div>
    </footer>
  )
}
