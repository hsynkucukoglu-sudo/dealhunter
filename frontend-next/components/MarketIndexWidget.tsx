'use client'
import { useMemo } from 'react'
import { Product, MARKET_COLORS } from '@/lib/types'
import { computeMarketStats, type MarketStat } from '@/lib/marketStats'

export function MarketIndexWidget({ products, marketStats }: {
  products: Product[]
  /** Serverside berekend over ALLE actieve deals. Zonder deze prop rekent het
      widget over `products`, en dat is op de homepage tot de idle-fetch alleen
      de 60 diepst afgeprijsde producten — zie computeMarketStats. */
  marketStats?: MarketStat[]
}) {
  // Sorteren op de diepste deal, niet op het gemiddelde.
  //
  // Het gemiddelde straft juist de ketens die we goed uitlezen: Albert Heijn
  // levert 347 aanbiedingen inclusief kleine kortingen (gem. -12%), Hoogvliet
  // alleen de 14 kopdeals uit de folder (gem. -42%). Dat verschil zit in onze
  // scrapedekking, niet in de winkel — lib/kortingsindex.ts documenteert dezelfde
  // meting over 12 weken en sorteert daarom bewust alfabetisch.
  //
  // De diepste deal heeft die scheefheid niet: méér uitlezen kan een keten alleen
  // maar helpen. En het is letterlijk wat de kop belooft ("beste kortingen").
  const stats = useMemo<MarketStat[]>(() =>
    [...(marketStats ?? computeMarketStats(products))]
      .sort((a, b) => b.maxDiscount - a.maxDiscount)
      .slice(0, 5)
  , [products, marketStats])

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
                  -{s.maxDiscount}%
                </span>
                <span className="text-[11px]" style={{ color: isTop ? 'rgba(255,255,255,0.6)' : '#9C9389' }}>
                  beste deal
                </span>
                {/* Het gemiddelde blijft staan als context — het is bruikbare
                    informatie, alleen geen eerlijke ranglijst (zie de sortering). */}
                <span className="text-[11px] font-semibold sm:mt-1" style={{ color: isTop ? 'rgba(255,255,255,0.5)' : '#C9C1B6' }}>
                  {s.dealCount} deals · gem. -{s.avgDiscount}%
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
