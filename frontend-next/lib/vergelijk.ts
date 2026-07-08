import { getProductsByMarket } from './api'
import { VISIBLE_MARKETS } from './types'
import type { Product } from './types'
import { detectCampaignType } from './campaignType'

export type MarketInfo = (typeof VISIBLE_MARKETS)[number]

export interface MarketPair {
  slug: string
  a: MarketInfo
  b: MarketInfo
}

const PAIR_SEPARATOR = '-vs-'

export function getAllPairs(): MarketPair[] {
  const pairs: MarketPair[] = []
  for (let i = 0; i < VISIBLE_MARKETS.length; i++) {
    for (let j = i + 1; j < VISIBLE_MARKETS.length; j++) {
      const a = VISIBLE_MARKETS[i]
      const b = VISIBLE_MARKETS[j]
      pairs.push({ slug: `${a.slug}${PAIR_SEPARATOR}${b.slug}`, a, b })
    }
  }
  return pairs
}

export function parsePairSlug(slug: string): { a: MarketInfo; b: MarketInfo } | null {
  const sepIndex = slug.indexOf(PAIR_SEPARATOR)
  if (sepIndex === -1) return null
  const aSlug = slug.slice(0, sepIndex)
  const bSlug = slug.slice(sepIndex + PAIR_SEPARATOR.length)
  const a = VISIBLE_MARKETS.find(m => m.slug === aSlug)
  const b = VISIBLE_MARKETS.find(m => m.slug === bSlug)
  return a && b ? { a, b } : null
}

export interface MarketStats {
  dealCount: number
  avgDiscount: number
  maxDiscount: number
  topDeal: Product | null
  topCategory: string
  onePlusOneCount: number
}

export async function getMarketStats(market: MarketInfo): Promise<MarketStats> {
  const products = await getProductsByMarket(market.name)
  const withDiscount = products.filter(p => p.discount > 0)

  if (withDiscount.length === 0) {
    return { dealCount: 0, avgDiscount: 0, maxDiscount: 0, topDeal: null, topCategory: '-', onePlusOneCount: 0 }
  }

  const avgDiscount = Math.round(
    withDiscount.reduce((sum, p) => sum + p.discount, 0) / withDiscount.length
  )
  const topDeal = [...withDiscount].sort((a, b) => b.discount - a.discount)[0]

  const catCount = new Map<string, number>()
  withDiscount.forEach(p => catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1))
  const topCategory = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  const onePlusOneCount = withDiscount.filter(
    p => detectCampaignType(p.name, p.discount, p.campaignType).type === '1+1'
  ).length

  return {
    dealCount: withDiscount.length,
    avgDiscount,
    maxDiscount: topDeal.discount,
    topDeal,
    topCategory,
    onePlusOneCount,
  }
}

export interface Winner {
  market: MarketInfo
  stats: MarketStats
  loser: MarketInfo
  loserStats: MarketStats
}

export function getWinner(a: MarketInfo, sa: MarketStats, b: MarketInfo, sb: MarketStats): Winner | null {
  if (sa.dealCount === 0 || sb.dealCount === 0 || sa.avgDiscount === sb.avgDiscount) return null
  return sa.avgDiscount > sb.avgDiscount
    ? { market: a, stats: sa, loser: b, loserStats: sb }
    : { market: b, stats: sb, loser: a, loserStats: sa }
}
