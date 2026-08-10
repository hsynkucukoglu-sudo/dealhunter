'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Product } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

interface FavoritesContextType {
  favorites: Product[]
  watchlist: Product[]
  isFavorite: (product: Product) => boolean
  isWatching: (product: Product) => boolean
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

  // Naam+markt-fallback, net als toggleFavorite hierboven. Zonder die fallback werkte
  // de volglijst maar één dag: product-ID's worden bij elke scrape opnieuw gegenereerd
  // (uuidv4 in models.createProduct, en de tabel wordt dagelijks geleegd en opnieuw
  // gevuld). De favorieten hadden deze fallback al, de volglijst niet — daardoor was
  // isWatching() na de eerstvolgende scrape voor álles false en vuurde de
  // "nog steeds in aanbieding"-melding nooit. (Gevonden 2026-08-10.)
  const sameProduct = (a: Product, b: Product) =>
    a.id === b.id || (a.name === b.name && a.market === b.market)

  const toggleWatch = (product: Product) => {
    setWatchlist(prev => {
      const next = prev.find(p => sameProduct(p, product))
        ? prev.filter(p => !sameProduct(p, product))
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
      isWatching: (product) => watchlist.some(p => sameProduct(p, product)),
      toggleFavorite, toggleWatch,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
