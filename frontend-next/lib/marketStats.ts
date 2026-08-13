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
/**
 * Som van alle kortingen over de meegegeven producten.
 *
 * Hoort net als computeMarketStats over de VOLLEDIGE lijst te gaan. Stond eerst
 * los in app/page.tsx; /tr is daar een kopie van en had de berekening én de prop
 * niet overgenomen, waardoor de Turkse homepage de client-subset toonde.
 */
export function computeTotalSavings(products: Product[]): number {
  return products.reduce((sum, p) =>
    p.originalPrice > p.discountedPrice && p.originalPrice > 0
      ? sum + (p.originalPrice - p.discountedPrice)
      : sum
  , 0)
}

/** Producten per supermarkt — voorkomt "Aldi 1 deals" zolang de client op 60 staat. */
export function computeMarketCounts(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of products) counts[p.market] = (counts[p.market] ?? 0) + 1
  return counts
}

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
