import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getWhatsAppLink, formatDisplayPhone, STORE_PHONE, STORE_EMAIL, STORE_ADDRESS, STORE_NAME } from '../config/storeConfig'

export default function ContactUsPage() {
  const { storeSettings } = useCart()
  const activePhone = storeSettings?.phone || STORE_PHONE
  const activeEmail = storeSettings?.email || STORE_EMAIL
  const activeAddress = storeSettings?.address || STORE_ADDRESS
  const activeStoreName = storeSettings?.storeName || STORE_NAME

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [formError, setFormError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.')
      return
    }

    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.')
      return
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError('Please enter a valid email address (e.g. name@domain.com).')
      return
    }

    setIsSubmitted(true)
  }

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
          <MessageSquare className="w-3.5 h-3.5" />
          We Are Here To Help
        </span>
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Contact Customer Support
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Have a question about your order, bulk corporate gifting, or product recommendations? Get in touch with our expert team at {activeStoreName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <h3 className="font-headline text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-4">
              Direct Channels
            </h3>

            {/* Hotline */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-body text-body-md font-bold text-primary">Customer Hotline</h4>
                <a href={`tel:${activePhone}`} className="font-headline text-headline-xs text-secondary font-bold mt-0.5 hover:underline block">
                  {formatDisplayPhone(activePhone)}
                </a>
                <p className="font-body text-body-xs text-on-surface-variant">Mon - Sun: 8:00 AM - 10:00 PM</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-body text-body-md font-bold text-primary">WhatsApp Support</h4>
                <p className="font-body text-body-xs text-on-surface-variant mt-0.5">Instant resolution & order tracking assistance</p>
                <a
                  href={getWhatsAppLink(`Hi ${activeStoreName}, I have an inquiry`, activePhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 font-label text-xs font-bold text-emerald-700 hover:underline"
                >
                  Start WhatsApp Chat →
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-body text-body-md font-bold text-primary">Email Support</h4>
                <a href={`mailto:${activeEmail}`} className="font-body text-body-sm font-semibold text-primary mt-0.5 hover:underline block">
                  {activeEmail}
                </a>
                <p className="font-body text-body-xs text-on-surface-variant">Responses within 2 business hours</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 pt-2 border-t border-outline-variant/20">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-body text-body-md font-bold text-primary">Headquarters & Store</h4>
                <p className="font-body text-body-xs text-on-surface-variant leading-relaxed">
                  {activeAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-headline text-headline-sm text-primary font-bold mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
                  Thank you for reaching out to {activeStoreName}. Our support representative will contact you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-headline text-headline-sm text-primary font-bold mb-2">
                  Send Us a Message
                </h3>

                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-label-sm text-on-surface-variant mb-1 font-semibold">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50) })}
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-label text-label-sm text-on-surface-variant mb-1 font-semibold">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1 font-semibold">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all"
                  />
                </div>

                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1 font-semibold">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                    <option value="Bulk Corporate Gifting">Bulk Corporate Gifting</option>
                    <option value="Custom Gift Hampers">Custom Gift Hampers</option>
                    <option value="Feedback / Complaints">Feedback / Complaints</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1 font-semibold">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message or order requirements here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl p-4 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-primary text-on-primary font-label text-label-md font-bold shadow-md hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
