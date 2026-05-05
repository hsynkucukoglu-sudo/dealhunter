'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '@/lib/types'

interface FavoritesContextType {
  favorites: Product[]
  watchlist: Product[]
  isFavorite: (id: string) => boolean
  isWatching: (id: string) => boolean
  toggleFavorite: (product: Product) => void
  toggleWatch: (product: Product) => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [], watchlist: [],
  isFavorite: () => false, isWatching: () => false,
  toggleFavorite: () => {}, toggleWatch: () => {},
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [watchlist, setWatchlist] = useState<Product[]>([])

  useEffect(() => {
    const f = localStorage.getItem('dh_favorites')
    const w = localStorage.getItem('dh_watchlist')
    if (f) setFavorites(JSON.parse(f))
    if (w) setWatchlist(JSON.parse(w))
  }, [])

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const next = prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
      localStorage.setItem('dh_favorites', JSON.stringify(next))
      return next
    })
  }

  const toggleWatch = (product: Product) => {
    setWatchlist(prev => {
      const next = prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
      localStorage.setItem('dh_watchlist', JSON.stringify(next))
      return next
    })
  }

  return (
    <FavoritesContext.Provider value={{
      favorites, watchlist,
      isFavorite: (id) => favorites.some(p => p.id === id),
      isWatching: (id) => watchlist.some(p => p.id === id),
      toggleFavorite, toggleWatch,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
