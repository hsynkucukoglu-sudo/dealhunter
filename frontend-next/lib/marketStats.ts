import type { Product } from './types'

export interface MarketStat {
  market: string
  avgDiscount: number
  maxDiscount: number
  dealCount: number
  topDeal: Product | null
}

// Onder deze grens is een gemiddelde geen gemiddelde meer. Waargenomen op de
// homepage 2026-08-13: DekaMarkt stond eerste met -63% op 2 aanbiedingen en
// Hoogvliet vierde met -60% op één. Eén diepe deal zette zo een hele keten op
// het podium boven Kruidvat met 45 aanbiedingen.
export const MIN_DEALS_FOR_RANKING = 5

/**
 * Berekent de weekstatistiek per supermarkt.
 *
 * Draai dit ALTIJD over de volledige productlijst, niet over wat de client
 * toevallig geladen heeft. De homepage rendert eerst 60 producten, gesorteerd
 * op kortingsdiepte — dat zijn per definitie de scherpste deals van de site, dus
 * een gemiddelde daarover geeft elke keten ~60%. Gemeten 2026-08-13: over die 60
 * kwam Kruidvat op -62%, over alle 1239 op -46%; Plus -59% tegen -35%.
 */
export function computeMarketStats(products: Product[]): MarketStat[] {
  const byMarket = new Map<string, Product[]>()
  for (const p of products) {
    if (!(p.originalPrice > p.discountedPrice) || !(p.originalPrice > 0)) continue
    const arr = byMarket.get(p.market) ?? []
    arr.push(p)
    byMarket.set(p.market, arr)
  }

  const pct = (p: Product) => ((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100

  return [...byMarket.entries()]
    .map(([market, deals]) => {
      const sorted = [...deals].sort((a, b) => pct(b) - pct(a))
      return {
        market,
        avgDiscount: Math.round(deals.reduce((s, p) => s + pct(p), 0) / deals.length),
        maxDiscount: Math.round(pct(sorted[0])),
        dealCount: deals.length,
        topDeal: sorted[0] ?? null,
      }
    })
    .filter(s => s.dealCount >= MIN_DEALS_FOR_RANKING)
}
