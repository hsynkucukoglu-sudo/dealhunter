'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

interface PriceEntry {
  minPrice: number
  weeks: number
}

interface PriceHistoryContextType {
  isLowestPrice: (name: string, market: string, currentPrice: number) => boolean
  getMinPrice: (name: string, market: string) => PriceEntry | null
}

const PriceHistoryContext = createContext<PriceHistoryContextType>({
  isLowestPrice: () => false,
  getMinPrice: () => null,
})

export function PriceHistoryProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<Record<string, PriceEntry>>({})

  useEffect(() => {
    fetch(`${API_BASE}/api/price-history-min`)
      .then(r => r.json())
      .then((data: Record<string, PriceEntry>) => setMap(data))
      .catch(() => {})
  }, [])

  const getMinPrice = (name: string, market: string) =>
    map[`${name}::${market}`] ?? null

  const isLowestPrice = (name: string, market: string, currentPrice: number) => {
    const entry = getMinPrice(name, market)
    if (!entry || entry.weeks < 2) return false
    return currentPrice <= entry.minPrice
  }

  return (
    <PriceHistoryContext.Provider value={{ isLowestPrice, getMinPrice }}>
      {children}
    </PriceHistoryContext.Provider>
  )
}

export function usePriceHistory() {
  return useContext(PriceHistoryContext)
}
