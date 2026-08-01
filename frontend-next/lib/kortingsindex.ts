import { getProducts } from './api'
import { VISIBLE_MARKETS } from './types'
import type { Product } from './types'
import { detectCampaignType } from './campaignType'

export interface MarketIndexEntry {
  market: string
  slug: string
  dealCount: number
  avgDiscount: number
  maxDiscount: number
  onePlusOneCount: number
}

export async function getKortingsindex(): Promise<MarketIndexEntry[]> {
  const products = await getProducts()
  const slugByName = new Map(VISIBLE_MARKETS.map(m => [m.name, m.slug]))

  const grouped = new Map<string, Product[]>()
  for (const p of products) {
    if (!slugByName.has(p.market)) continue
    if (!(p.discount > 0)) continue
    const arr = grouped.get(p.market) ?? []
    arr.push(p)
    grouped.set(p.market, arr)
  }

  const entries: MarketIndexEntry[] = []
  for (const [market, list] of grouped) {
    const avgDiscount = Math.round(list.reduce((s, p) => s + p.discount, 0) / list.length)
    const maxDiscount = Math.max(...list.map(p => p.discount))
    const onePlusOneCount = list.filter(
      p => detectCampaignType(p.name, p.discount, p.campaignType).type === '1+1'
    ).length
    entries.push({ market, slug: slugByName.get(market)!, dealCount: list.length, avgDiscount, maxDiscount, onePlusOneCount })
  }

  // Alfabetisch, NIET op gemiddelde korting.
  //
  // Sorteren op gemiddelde korting suggereert een ranglijst ("deze supermarkt geeft de
  // meeste korting") die de data niet kan dragen: de scraperdekking verschilt per keten.
  // Meting 2026-08-01 over 12 weken: Hoogvliet levert 27-31 producten per week (alleen de
  // kopdeals uit de folder, dus hoge percentages), Albert Heijn 167-743 (het hele
  // assortiment inclusief kleine kortingen). Het verschil tussen "Hoogvliet 43%" en
  // "AH 18%" zit in wat we ophalen, niet in wat de winkel doet.
  return entries.sort((a, b) => a.market.localeCompare(b.market, 'nl'))
}

export function getMonthLabel(): string {
  return new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
}
