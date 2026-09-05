import { createContext, useContext, useState, useEffect } from 'react'
import { STORE_PHONE, STORE_WHATSAPP, formatDisplayPhone } from '../config/storeConfig'

const AuthContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('royaldryfruits_auth_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (e) {
      console.warn('Failed to parse auth user from localStorage:', e)
    }
  }, [])

  const loginWithPin = async (phone, pin) => {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10)
    const response = await fetch(`${API_BASE}/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, pin: String(pin).trim() }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage = data?.message || 'Invalid mobile number or PIN. Please try again.'
      throw new Error(errorMessage)
    }

    const userData = {
      name: data.name || 'Valued Customer',
      phone: data.phone || cleanPhone,
      email: data.email || null,
      isLoggedIn: !data.mustChangePin,
      loginAt: new Date().toISOString(),
      token: data.token,
      mustChangePin: Boolean(data.mustChangePin),
    }

    if (!data.mustChangePin) {
      setUser(userData)
      localStorage.setItem('royaldryfruits_auth_user', JSON.stringify(userData))
      localStorage.setItem('royaldryfruits_customer_phone', cleanPhone)
    }

    return userData
  }

  const changePin = async (phone, oldPin, newPin) => {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10)
    const cleanOldPin = String(oldPin).trim()
    const cleanNewPin = String(newPin).trim()

    const response = await fetch(`${API_BASE}/auth/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        oldPin: cleanOldPin,
        newPin: cleanNewPin,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage = data?.message || 'Failed to update PIN. Please check your details.'
      throw new Error(errorMessage)
    }

    const userData = {
      name: data.name || 'Valued Customer',
      phone: data.phone || cleanPhone,
      email: data.email || null,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
      token: data.token,
      mustChangePin: false,
    }

    setUser(userData)
    localStorage.setItem('royaldryfruits_auth_user', JSON.stringify(userData))
    localStorage.setItem('royaldryfruits_customer_phone', cleanPhone)

    return userData
  }

  const registerWithPin = async (fullName, phone, pin) => {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10)
    const cleanName = String(fullName).trim()
    const cleanPin = String(pin).trim()

    const response = await fetch(`${API_BASE}/auth/register-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: cleanName,
        phone: cleanPhone,
        pin: cleanPin,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage = data?.message || 'Registration failed. Please check your details.'
      throw new Error(errorMessage)
    }

    const userData = {
      name: data.name || cleanName || 'Valued Customer',
      phone: data.phone || cleanPhone,
      email: data.email || null,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
      token: data.token,
    }

    setUser(userData)
    localStorage.setItem('royaldryfruits_auth_user', JSON.stringify(userData))
    localStorage.setItem('royaldryfruits_customer_phone', cleanPhone)

    return userData
  }

  const getForgotPinInfo = async (phone) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10)
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-pin/${cleanPhone || '0'}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (e) {
      console.warn('Could not fetch forgot pin info from API:', e)
    }
    return {
      phone: cleanPhone,
      supportPhone: formatDisplayPhone(STORE_PHONE),
      supportWhatsApp: STORE_WHATSAPP,
      message: 'Please contact support to reset your PIN.',
      isRegistered: false,
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('royaldryfruits_auth_user')
      localStorage.removeItem('royaldryfruits_customer_phone')
    } catch (e) {
      console.warn('LocalStorage remove error:', e)
    }
  }

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user?.isLoggedIn),
        loginWithPin,
        changePin,
        registerWithPin,
        getForgotPinInfo,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
