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

  return entries.sort((a, b) => b.avgDiscount - a.avgDiscount)
}

export function getMonthLabel(): string {
  return new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
}
