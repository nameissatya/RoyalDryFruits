import { useState, useEffect } from 'react'
import {
  X,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  KeyRound,
  PhoneCall,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  STORE_PHONE,
  STORE_WHATSAPP,
  getWhatsAppLink,
  formatDisplayPhone,
} from '../../config/storeConfig'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPin,
    changePin,
    registerWithPin,
    getForgotPinInfo,
  } = useAuth()

  // Modes: 'login' | 'register' | 'forgot' | 'resetPin'
  const [mode, setMode] = useState('login')

  // Form Fields
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [tempPin, setTempPin] = useState('')
  const [showPin, setShowPin] = useState(false)

  // Status & Support
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [supportInfo, setSupportInfo] = useState({
    supportPhone: formatDisplayPhone(STORE_PHONE),
    supportWhatsApp: STORE_WHATSAPP,
    message: 'Please contact support to reset your PIN.',
  })

  useEffect(() => {
    if (isAuthModalOpen) {
      setError('')
      setSuccessMsg('')
      setMode('login')
      setPhone('')
      setFullName('')
      setPin('')
      setConfirmPin('')
      setTempPin('')
      setShowPin(false)
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const cleanPhone = phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('Please enter your 4 to 6-digit security PIN.')
      return
    }

    setIsLoading(true)
    try {
      const userRes = await loginWithPin(cleanPhone, pin)
      if (userRes?.mustChangePin) {
        setTempPin(pin)
        setPin('')
        setConfirmPin('')
        setMode('resetPin')
        setSuccessMsg('Temporary PIN verified. Please set your new private PIN below.')
        return
      }
      closeAuthModal()
    } catch (err) {
      setError(err.message || 'Invalid mobile number or PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Reset / Change PIN after temporary PIN login
  const handleResetPin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const cleanPhone = phone.replace(/\D/g, '')
    if (!/^\d{4,6}$/.test(pin)) {
      setError('New PIN must be 4 to 6 numeric digits.')
      return
    }

    if (pin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match.')
      return
    }

    if (tempPin && pin === tempPin) {
      setError('Your new PIN must be different from your temporary PIN.')
      return
    }

    setIsLoading(true)
    try {
      await changePin(cleanPhone, tempPin, pin)
      setSuccessMsg('PIN successfully updated! Signing you in...')
      setTimeout(() => {
        closeAuthModal()
      }, 800)
    } catch (err) {
      setError(err.message || 'Failed to update PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const cleanName = fullName.trim()
    if (cleanName.length < 2) {
      setError('Please enter your full name.')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 numeric digits.')
      return
    }

    if (pin !== confirmPin) {
      setError('PIN and Confirm PIN do not match.')
      return
    }

    setIsLoading(true)
    try {
      await registerWithPin(cleanName, cleanPhone, pin)
      closeAuthModal()
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Forgot PIN switch
  const openForgotPin = async () => {
    setError('')
    setSuccessMsg('')
    setMode('forgot')
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 10) {
      const info = await getForgotPinInfo(cleanPhone)
      if (info) setSupportInfo(info)
    }
  }

  // WhatsApp Support Link
  const getWhatsAppSupportLink = () => {
    const cleanPhone = phone.replace(/\D/g, '')
    const targetWa = supportInfo.supportWhatsApp || STORE_WHATSAPP
    const phoneText = cleanPhone ? `+91 ${cleanPhone}` : 'my registered number'
    const msg = `Hello Royal Dry Fruits Support, I need help resetting my account PIN for mobile number ${phoneText}. Please assist me.`
    return getWhatsAppLink(msg, targetWa)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center font-bold shadow-sm">
            {mode === 'forgot' ? (
              <KeyRound className="w-7 h-7 text-secondary" />
            ) : mode === 'resetPin' ? (
              <KeyRound className="w-7 h-7 text-primary" />
            ) : mode === 'register' ? (
              <Sparkles className="w-7 h-7 text-primary" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-primary" />
            )}
          </div>
          <h3 className="font-headline text-headline-sm text-primary font-bold">
            {mode === 'login' && 'Sign In with Mobile & PIN'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot' && 'Reset Your PIN'}
            {mode === 'resetPin' && 'Set Your New Security PIN'}
          </h3>
          <p className="font-body text-body-xs text-on-surface-variant mt-1">
            {mode === 'login' && 'Fast, simple & secure login with your 4/6-digit PIN'}
            {mode === 'register' && 'Quick 30-second signup for easy order tracking'}
            {mode === 'forgot' && 'Contact support to verify and reset your PIN'}
            {mode === 'resetPin' && 'Create a private 4 or 6-digit PIN to secure your account'}
          </p>
        </div>

        {/* Mode Selector Tabs (when in standard login/register) */}
        {mode !== 'forgot' && mode !== 'resetPin' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-2xl mb-6 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`py-2.5 rounded-xl font-label text-label-md font-bold transition-all cursor-pointer ${mode === 'login'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`py-2.5 rounded-xl font-label text-label-md font-bold transition-all cursor-pointer ${mode === 'register'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              New Customer
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Mobile Number
              </label>
              <div className="flex rounded-2xl border border-outline-variant/60 bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <div className="flex items-center gap-1.5 px-3.5 bg-surface-container-low border-r border-outline-variant/50 text-on-surface font-bold text-sm select-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-transparent px-3.5 py-3 font-body text-body-md text-on-surface outline-none tracking-wider placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="font-label text-label-sm font-semibold text-on-surface">
                  Security PIN
                </label>
                <button
                  type="button"
                  onClick={openForgotPin}
                  className="text-xs text-secondary hover:text-primary font-semibold hover:underline cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter your PIN"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-11 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-primary text-on-primary font-label text-label-md py-3.5 rounded-2xl shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-on-surface-variant">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50))}
                  placeholder="Enter your full name"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Mobile Number
              </label>
              <div className="flex rounded-2xl border border-outline-variant/60 bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <div className="flex items-center gap-1.5 px-3.5 bg-surface-container-low border-r border-outline-variant/50 text-on-surface font-bold text-sm select-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-transparent px-3.5 py-2.5 font-body text-body-md text-on-surface outline-none tracking-wider placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Create PIN */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Create Security PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Create 4 or 6-digit PIN"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-11 py-2.5 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm PIN */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Confirm PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Re-enter your PIN"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-primary text-on-primary font-label text-label-md py-3.5 rounded-2xl shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account & Sign In'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-on-surface-variant">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 3. FORGOT PIN VIEW */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/30 text-xs text-on-surface space-y-2">
              <p className="font-semibold text-secondary-container-foreground">
                🔒 Secure PIN Reset
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Since we protect your security without SMS OTP costs, our friendly store support team will verify your identity and instantly reset your PIN.
              </p>
            </div>

            {/* Mobile number confirm */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Your Registered Mobile Number
              </label>
              <div className="flex rounded-2xl border border-outline-variant/60 bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <div className="flex items-center gap-1.5 px-3.5 bg-surface-container-low border-r border-outline-variant/50 text-on-surface font-bold text-sm select-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-transparent px-3.5 py-3 font-body text-body-md text-on-surface outline-none tracking-wider placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Direct Support Contact Buttons */}
            <div className="space-y-2.5 pt-2">
              <a
                href={getWhatsAppSupportLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-label text-label-md py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2.5 font-bold transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp Support</span>
              </a>

              <a
                href={`tel:${(supportInfo.supportPhone || STORE_PHONE).replace(/\s/g, '')}`}
                className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-label-md py-3 px-4 rounded-2xl border border-outline-variant/40 flex items-center justify-center gap-2.5 font-semibold transition-all"
              >
                <PhoneCall className="w-4 h-4 text-primary" />
                <span>Call Support ({supportInfo.supportPhone || formatDisplayPhone(STORE_PHONE)})</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className="w-full text-center text-xs text-primary font-bold py-2 hover:underline cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* 4. RESET PIN FORM (Mandatory when login with temporary PIN) */}
        {mode === 'resetPin' && (
          <form onSubmit={handleResetPin} className="space-y-4 text-left">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-on-surface space-y-1">
              <p className="font-semibold text-amber-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Temporary PIN Detected</span>
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                You logged in using a temporary PIN issued by support. For account security, please create your new private 4 to 6-digit PIN now.
              </p>
            </div>

            {/* Mobile Number (Read-only display) */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
              <span className="text-xs text-on-surface-variant font-medium">Registered Mobile:</span>
              <span className="text-xs font-bold text-on-surface tracking-wider">+91 {phone.replace(/\D/g, '')}</span>
            </div>

            {/* New PIN */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                New Security PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter new 4 or 6-digit PIN"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-11 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New PIN */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-sm font-semibold text-on-surface">
                Confirm New PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Re-enter new PIN"
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl pl-10 pr-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-primary text-on-primary font-label text-label-md py-3.5 rounded-2xl shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save New PIN & Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
                setSuccessMsg('')
                setTempPin('')
                setPin('')
                setConfirmPin('')
              }}
              className="w-full text-center text-xs text-on-surface-variant hover:text-primary font-semibold py-1 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
