'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

interface PriceEntry {
  minPrice: number
  weeks: number
}

interface PriceHistoryContextType {
  isLowestPrice: (name: string, market: string, currentPrice: number, unitSize?: number | null, unitType?: string | null) => boolean
  getMinPrice: (name: string, market: string, unitSize?: number | null, unitType?: string | null) => PriceEntry | null
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

  const getMinPrice = (name: string, market: string, unitSize?: number | null, unitType?: string | null) => {
    // Try unit-aware key first (new records); fall back to legacy name::market key
    if (unitSize != null && unitType) {
      const unitKey = `${name}::${market}::${unitSize}::${unitType}`
      if (map[unitKey]) return map[unitKey]
    }
    return map[`${name}::${market}`] ?? null
  }

  const isLowestPrice = (name: string, market: string, currentPrice: number, unitSize?: number | null, unitType?: string | null) => {
    const entry = getMinPrice(name, market, unitSize, unitType)
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
