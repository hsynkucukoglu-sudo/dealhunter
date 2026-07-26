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

  // De backend levert nu alleen nog `name::market`-sleutels. De oude unit-sleutel
  // (`name::market::size::type`) bestond niet echt: de UNIQUE-constraint op
  // price_history bevat de unit-kolommen niet, dus die sleutel splitste de
  // historie van één product op i.p.v. producten te scheiden — met een echte
  // false positive op het label tot gevolg. Zie getMinPriceMap() in backend/db.js.
  // unitSize/unitType blijven in de signatuur staan voor bestaande callers, maar
  // doen bewust niets meer.
  const getMinPrice = (name: string, market: string) => {
    return map[`${name}::${market}`] ?? null
  }

  const isLowestPrice = (name: string, market: string, currentPrice: number) => {
    const entry = getMinPrice(name, market)
    // >=3 weken i.p.v. 2: met 2 weken is "huidige prijs is de laagste" te vaak
    // triviaal waar (product net opgenomen), wat het label betekenisloos maakt.
    if (!entry || entry.weeks < 3) return false
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
