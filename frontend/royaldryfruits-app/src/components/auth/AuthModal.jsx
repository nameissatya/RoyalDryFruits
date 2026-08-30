import { useState, useEffect } from 'react'
import { X, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, sendOtp, verifyOtp } = useAuth()
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthModalOpen) {
      setError('')
      setStep(1)
      setPhone('')
      setOtp('')
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const cleanPhone = phone.replace(/\D/g, '')
    if (!/^([6-9]\d{9})$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian phone number.')
      setIsLoading(false)
      return
    }

    try {
      await sendOtp(cleanPhone)
      setStep(2)
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (otp.length !== 4) {
      setError('Please enter a 4-digit OTP.')
      setIsLoading(false)
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    try {
      await verifyOtp(cleanPhone, otp)
      closeAuthModal()
    } catch (err) {
      setError('Incorrect OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface rounded-3xl w-full max-w-md p-6 shadow-2xl border border-outline-variant/30 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container/40 text-secondary mx-auto mb-3 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-headline text-headline-sm text-primary font-bold">
            Sign In securely
          </h3>
          <p className="font-body text-body-xs text-on-surface-variant mt-2 mb-6">
            {step === 1 ? 'Enter your mobile number to get an OTP' : `Enter the 4-digit code sent to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 pb-4">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface-variant text-left">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-on-surface-variant font-bold font-body">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-12 pr-4 py-3 font-body text-body-md text-on-surface outline-none focus:ring-2 focus:ring-surface-tint focus:border-surface-tint transition-all"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center w-full">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-label text-label-md py-3.5 rounded-full shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label-md text-on-surface-variant text-center">4-Digit Security Code</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] bg-surface-container border border-outline-variant/50 rounded-xl py-3.5 text-primary outline-none focus:border-secondary transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center w-full">
                  {error}
                </p>
              )}

              <p className="text-xs text-primary font-medium bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-center w-full">
                For testing, please use OTP: <strong>1234</strong>
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-secondary text-on-secondary font-label text-label-md py-3.5 rounded-full shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-secondary font-label text-label-sm mt-2 hover:underline cursor-pointer text-center"
              >
                Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
