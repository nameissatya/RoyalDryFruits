import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { fetchStoreSettingsApi } from '../services/settingsApi'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'royaldryfruits_cart_items'

export function CartProvider({ children }) {
  const [storeSettings, setStoreSettings] = useState(null)

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Fetch live store settings on mount
  useEffect(() => {
    let isMounted = true
    async function loadSettings() {
      const data = await fetchStoreSettingsApi()
      if (isMounted && data) {
        setStoreSettings(data)
      }
    }
    loadSettings()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e)
    }
  }, [items])

  const addItem = useCallback((product) => {
    if (!product || !product.id) return
    const qtyToAdd = Number(product.quantity) || 1

    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id)
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qtyToAdd,
          price: product.price || updated[existingIdx].price,
          weight: product.weight || updated[existingIdx].weight,
          image: product.image || updated[existingIdx].image
        }
        return updated
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          weight: product.weight || '500g',
          price: Number(product.price) || 0,
          quantity: qtyToAdd,
          image: product.image || null,
        }
      ]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch {}
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [items]
  )

  const freeDeliveryRadius = useMemo(
    () => Number(storeSettings?.freeDeliveryRadius) || 0,
    [storeSettings]
  )

  const maxDeliveryRadius = useMemo(
    () => Number(storeSettings?.deliveryRadius) || 0,
    [storeSettings]
  )

  const freeDeliveryThreshold = useMemo(
    () => Number(storeSettings?.freeDeliveryThreshold) || 0,
    [storeSettings]
  )

  const baseDeliveryCharge = useMemo(
    () => Number(storeSettings?.deliveryCharge) || 0,
    [storeSettings]
  )

  const minOrderValue = useMemo(
    () => Number(storeSettings?.minOrderValue) || 0,
    [storeSettings]
  )

  // Default delivery fee is ₹0 (FREE). Distance-based delivery fee is evaluated at Checkout upon address confirmation.
  const deliveryFee = useMemo(() => {
    return 0
  }, [])

  const isFreeDelivery = useMemo(
    () => items.length > 0,
    [items.length]
  )

  const amountNeededForFreeDelivery = useMemo(() => {
    if (freeDeliveryThreshold <= 0 || subtotal >= freeDeliveryThreshold) return 0
    return freeDeliveryThreshold - subtotal
  }, [subtotal, freeDeliveryThreshold])

  const total = subtotal + deliveryFee

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      storeSettings,
      freeDeliveryRadius,
      maxDeliveryRadius,
      freeDeliveryThreshold,
      baseDeliveryCharge,
      minOrderValue,
      isFreeDelivery,
      amountNeededForFreeDelivery,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      storeSettings,
      freeDeliveryRadius,
      maxDeliveryRadius,
      freeDeliveryThreshold,
      baseDeliveryCharge,
      minOrderValue,
      isFreeDelivery,
      amountNeededForFreeDelivery,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
