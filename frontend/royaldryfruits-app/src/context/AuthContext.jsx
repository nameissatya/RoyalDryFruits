import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

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

  const loginWithPhone = (phone, name = '') => {
    const cleanPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : phone
    const userData = {
      phone: formattedPhone,
      rawPhone: cleanPhone,
      name: name || 'Valued Customer',
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    }
    setUser(userData)
    try {
      localStorage.setItem('royaldryfruits_auth_user', JSON.stringify(userData))
      localStorage.setItem('royaldryfruits_customer_phone', formattedPhone)
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
    return userData
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('royaldryfruits_auth_user')
      localStorage.removeItem('royaldryfruits_customer_phone')
      localStorage.removeItem('royaldryfruits_customer_orders')
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
        loginWithPhone,
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
