import { useState } from 'react'
import { X } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'
import { getWhatsAppLink } from '../../config/storeConfig'

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenWhatsApp = () => {
    const link = getWhatsAppLink('Hi Royal Dry Fruits! I would like to place an order or inquire about dry fruit hampers.')
    window.open(link, '_blank')
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-6 z-40 flex flex-col items-end">
      {/* Quick Action Popup */}
      {isOpen && (
        <div className="mb-3 bg-surface border border-outline-variant/30 rounded-2xl p-4 shadow-2xl max-w-xs text-left animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline text-headline-sm text-primary font-bold">
              Chat with Royal Dry Fruits
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="font-body text-body-md text-on-surface-variant text-sm mb-3">
            Need help selecting gift hampers or ordering locally? Message us directly on WhatsApp for instant assistance!
          </p>
          <button
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] text-white font-label text-label-md py-2.5 rounded-full flex items-center justify-center gap-2 font-bold hover:brightness-105 transition-all shadow-sm cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Start WhatsApp Chat
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Order on WhatsApp"
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group relative cursor-pointer"
      >
        <WhatsAppIcon className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
          1
        </span>
      </button>
    </div>
  )
}
