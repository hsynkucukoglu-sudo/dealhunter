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

// Folderaanbiedingen die géén enkel product zijn maar een categorie:
//   "Alle Sensodyne"                    -> alle varianten van dat merk
//   "Rode paprika of courgette"         -> "of" = of; twee verschillende producten
//   "Odorex deodorant Bus 150 ml of roller 50 ml"
//
// Bij zulke namen wisselt het onderliggende product per week, dus is er geen
// prijsverloop van één artikel om tegen af te zetten. Gemeten voorbeeld:
// "Lipton" (Jumbo) stond weken op EUR 18,16 (adviesprijs 21,36), dook in juni
// drie weken naar EUR 2,25 (adviesprijs 3,69) en ging daarna terug — dat zijn
// twee verschillende artikelen onder dezelfde naam. Een "laagste prijs ooit"-
// claim is daar per definitie betekenisloos, dus tonen we het label niet.
//
// Dit is geen scraper-bug: de folder adverteert de actie zélf op categorieniveau.
// Raakt 45 van de 299 producten die het label nu zouden krijgen (gemeten
// 2026-07-26). Bewust conservatief: liever een label te weinig dan een claim
// die niet klopt.
const CATEGORY_OFFER = /^alle\b|\bof\b|\bt\/m\b|\bdiverse\b|\bassorti/i

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
    // Categorie-aanbieding: geen vast artikel om een prijsverloop van te hebben.
    if (CATEGORY_OFFER.test(name)) return false
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
