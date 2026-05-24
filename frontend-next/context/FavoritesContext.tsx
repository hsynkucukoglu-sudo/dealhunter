'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Product } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

interface FavoritesContextType {
  favorites: Product[]
  watchlist: Product[]
  isFavorite: (product: Product) => boolean
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
  const { data: session } = useSession()
  const userId = (session?.user as { id?: string })?.id ?? null

  const [favorites, setFavorites] = useState<Product[]>([])
  const [watchlist, setWatchlist] = useState<Product[]>([])
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null)

  // localStorage'dan yükle
  useEffect(() => {
    const f = localStorage.getItem('dh_favorites')
    const w = localStorage.getItem('dh_watchlist')
    if (f) setFavorites(JSON.parse(f))
    if (w) setWatchlist(JSON.parse(w))
  }, [])

  // Login olunca backend'den favorileri çek ve birleştir
  useEffect(() => {
    if (!userId || userId === syncedUserId) return

    fetch(`${API_BASE}/api/favorites?user_id=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then((rows: { product_name: string; product_market: string }[]) => {
        if (!Array.isArray(rows) || !rows.length) return
        setFavorites(prev => {
          // Backend'deki favorileri localStorage ile birleştir
          const merged = [...prev]
          for (const row of rows) {
            const alreadyIn = merged.some(
              p => p.name === row.product_name && p.market === row.product_market
            )
            if (!alreadyIn) {
              // Backend'deki favori şu an DB'de yoksa, minimal placeholder ekle
              merged.push({
                id: `fav::${row.product_name}::${row.product_market}`,
                name: row.product_name,
                market: row.product_market,
                originalPrice: 0,
                discountedPrice: 0,
                discount: 0,
                imageUrl: null,
                isCampaign: false,
                source: '',
                expiresAt: '',
                createdAt: '',
                category: 'overig',
              } as Product)
            }
          }
          localStorage.setItem('dh_favorites', JSON.stringify(merged))
          return merged
        })
        setSyncedUserId(userId)
      })
      .catch(() => {})
  }, [userId, syncedUserId])

  const syncToApi = useCallback(
    (action: 'add' | 'remove', product: Product) => {
      if (!userId) return
      const body = JSON.stringify({
        user_id: userId,
        product_name: product.name,
        product_market: product.market,
      })
      fetch(`${API_BASE}/api/favorites`, {
        method: action === 'add' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => {})
    },
    [userId]
  )

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const isIn = prev.find(p => p.id === product.id || (p.name === product.name && p.market === product.market))
      const next = isIn
        ? prev.filter(p => p.id !== product.id && !(p.name === product.name && p.market === product.market))
        : [...prev, product]
      localStorage.setItem('dh_favorites', JSON.stringify(next))
      syncToApi(isIn ? 'remove' : 'add', product)
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
      isFavorite: (product) => favorites.some(p =>
        p.id === product.id ||
        (p.name === product.name && p.market === product.market)
      ),
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
