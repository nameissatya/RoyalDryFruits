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

  const sendOtp = async (phone) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!response.ok) throw new Error('Failed to send OTP');
      return await response.json();
    } catch (err) {
      console.error('Send OTP failed:', err);
      throw err;
    }
  }

  const verifyOtp = async (phone, otp, fullName = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, fullName })
      });
      if (!response.ok) throw new Error('Failed to verify OTP');
      
      const data = await response.json();
      
      // We assume data has { token, email, role } based on our backend
      const userData = {
        name: fullName || 'Valued Customer',
        email: data.email,
        phone: phone,
        isLoggedIn: true,
        loginAt: new Date().toISOString(),
        token: data.token,
      }
      
      setUser(userData)
      localStorage.setItem('royaldryfruits_auth_user', JSON.stringify(userData))
      localStorage.setItem('royaldryfruits_customer_phone', phone)
      
      return userData
    } catch (err) {
      console.error('Verify OTP failed:', err);
      throw err;
    }
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
        sendOtp,
        verifyOtp,
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
