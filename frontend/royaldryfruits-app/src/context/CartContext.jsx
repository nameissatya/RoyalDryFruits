import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'royaldryfruits_cart_items'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

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

  const deliveryFee = 0 // Free local delivery within 10km

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
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, itemCount]
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
