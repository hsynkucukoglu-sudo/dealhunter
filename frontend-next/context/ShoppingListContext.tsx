'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/types'

export interface CartItem extends Product {
  quantity: number
}

interface ShoppingListContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  totalCost: number
  totalSavings: number
  itemCount: number
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined)

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dealhunter_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('dealhunter_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string) => setItems(prev => prev.filter(item => item.id !== id))

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id)
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const clearCart = () => setItems([])

  const totalCost = items.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0)
  const totalSavings = items.reduce((sum, item) => {
    const saving = item.originalPrice > item.discountedPrice ? (item.originalPrice - item.discountedPrice) * item.quantity : 0
    return sum + saving
  }, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <ShoppingListContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, totalCost, totalSavings, itemCount }}>
      {children}
    </ShoppingListContext.Provider>
  )
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext)
  if (!ctx) throw new Error('useShoppingList must be used within ShoppingListProvider')
  return ctx
}
