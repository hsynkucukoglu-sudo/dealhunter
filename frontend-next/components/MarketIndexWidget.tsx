'use client'
import { useMemo } from 'react'
import { Product, MARKET_COLORS } from '@/lib/types'

interface MarketStat {
  market: string
  avgDiscount: number
  dealCount: number
  topDeal: Product | null
}

export function MarketIndexWidget({ products }: { products: Product[] }) {
  const stats = useMemo<MarketStat[]>(() => {
    const byMarket = new Map<string, Product[]>()
    for (const p of products) {
      if (!byMarket.has(p.market)) byMarket.set(p.market, [])
      byMarket.get(p.market)!.push(p)
    }

    return [...byMarket.entries()]
      .map(([market, prods]) => {
        const discounted = prods.filter(p => p.originalPrice > p.discountedPrice && p.originalPrice > 0)
        const avgDiscount = discounted.length
          ? Math.round(discounted.reduce((s, p) => s + ((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100, 0) / discounted.length)
          : 0
        const topDeal = discounted.sort((a, b) =>
          ((b.originalPrice - b.discountedPrice) / b.originalPrice) - ((a.originalPrice - a.discountedPrice) / a.originalPrice)
        )[0] ?? null
        return { market, avgDiscount, dealCount: discounted.length, topDeal }
      })
      .filter(s => s.dealCount > 0)
      .sort((a, b) => b.avgDiscount - a.avgDiscount)
      .slice(0, 5)
  }, [products])

  if (stats.length === 0) return null

  const medals = ['🥇', '🥈', '🥉', '4.', '5.']

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 18 }}>🏆</span>
        <h2 className="text-base font-black uppercase tracking-wide" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}>
          Deze week de beste kortingen
        </h2>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: '#E33D26', color: 'white' }}>
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {stats.map((s, i) => {
          const color = MARKET_COLORS[s.market] ?? '#1A1A1A'
          const isTop = i === 0
          return (
            <div
              key={s.market}
              className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 px-4 py-3 sm:px-3 sm:py-4 rounded-2xl transition-transform hover:scale-[1.02]"
              style={{
                background: isTop ? '#1A1A1A' : 'rgba(255,255,255,0.8)',
                border: isTop ? 'none' : '1px solid rgba(201,193,182,0.4)',
                boxShadow: isTop ? '0 4px 0 rgba(0,0,0,0.15)' : '0 2px 0 #DDD0C4',
              }}
            >
              <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-full">
                <span className="text-lg leading-none">{medals[i]}</span>
                <div className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: color }} />
                <span className="text-sm font-bold truncate" style={{ color: isTop ? 'white' : '#1A1A1A' }}>
                  {s.market}
                </span>
              </div>
              <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:mt-2">
                <span className="text-xl font-black" style={{ color: isTop ? '#E33D26' : color }}>
                  -{s.avgDiscount}%
                </span>
                <span className="text-[11px]" style={{ color: isTop ? 'rgba(255,255,255,0.6)' : '#9C9389' }}>
                  gem. korting
                </span>
                <span className="text-[11px] font-semibold sm:mt-1" style={{ color: isTop ? 'rgba(255,255,255,0.5)' : '#C9C1B6' }}>
                  {s.dealCount} deals
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {stats[0]?.topDeal && (
        <p className="text-xs mt-2" style={{ color: '#9C9389' }}>
          🔥 Beste deal deze week: <strong style={{ color: '#1A1A1A' }}>{stats[0].topDeal.name}</strong> bij {stats[0].market} — €{stats[0].topDeal.discountedPrice.toFixed(2)}
          {stats[0].topDeal.originalPrice > stats[0].topDeal.discountedPrice && (
            <span style={{ color: '#C9C1B6' }}> (was €{stats[0].topDeal.originalPrice.toFixed(2)})</span>
          )}
        </p>
      )}
    </section>
  )
}
