import { useState, useEffect } from 'react'
import { X, ShieldCheck, Lock, Smartphone, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PhoneLoginModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithPhone } = useAuth()

  const [step, setStep] = useState(1) // 1: Phone input, 2: OTP verify
  const [phoneInput, setPhoneInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1)
      setPhoneInput('')
      setNameInput('')
      setEnteredOtp('')
      setOtpError('')
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleSendOtp = (e) => {
    e.preventDefault()
    const cleanDigits = phoneInput.replace(/\D/g, '')
    if (cleanDigits.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number')
      return
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOtp(otp)
    setOtpError('')
    setStep(2)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (enteredOtp.trim() === generatedOtp) {
      loginWithPhone(phoneInput, nameInput)
      closeAuthModal()
    } else {
      setOtpError('Incorrect OTP code. Please try again.')
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container/40 text-secondary mx-auto mb-3 flex items-center justify-center font-bold">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="font-headline text-headline-sm text-primary font-bold">
            {step === 1 ? 'Login with Mobile Number' : 'Verify Security OTP'}
          </h3>
          <p className="font-body text-body-xs text-on-surface-variant mt-1">
            {step === 1
              ? 'Access your private orders and quick checkout'
              : `Code sent to +91 ${phoneInput.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        {step === 1 ? (
          /* Step 1: Mobile Number Form */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Satya"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all"
              />
            </div>

            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl font-body text-body-md text-on-surface outline-none focus:border-secondary transition-all font-semibold"
                />
              </div>
            </div>

            {otpError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
                {otpError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-label text-label-md font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Get OTP Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Demo OTP Banner */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-center text-xs font-body">
              🔒 <span className="font-bold">Security Demo OTP Code:</span>{' '}
              <span className="text-sm font-bold text-emerald-700 tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded ml-1">
                {generatedOtp}
              </span>
            </div>

            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-2 text-center">
                Enter 4-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="• • • •"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="w-full text-center text-2xl font-bold tracking-[0.5em] bg-surface-container border border-outline-variant rounded-xl py-3.5 text-primary outline-none focus:border-secondary"
              />
            </div>

            {otpError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
                {otpError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-label text-label-md font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify & Login</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs font-label text-on-surface-variant hover:text-secondary text-center font-semibold pt-1"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
