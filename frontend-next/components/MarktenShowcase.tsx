'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product, VISIBLE_MARKETS } from '@/lib/types'
import { MarketLogo } from './MarketLogo'

interface Props {
  products: Product[]
  /** Sunucudan gelen gerçek market→ürün sayıları. Client state başlangıçta sadece
      top 60 ürün içerdiğinden, bunlar olmadan "Aldi 1 deals" / eksik market
      kartı ("9 winkels") görünüyordu. */
  serverCounts?: Record<string, number>
  onSelectMarket: (market: string) => void
}

export function MarktenShowcase({ products, serverCounts, onSelectMarket }: Props) {
  const marketStats = useMemo(() => {
    return VISIBLE_MARKETS.map(m => {
      const mProducts = products.filter(p => p.market === m.name)
      const withDiscount = mProducts.filter(p => p.originalPrice > p.discountedPrice && p.discount > 0)
      const bestDeal = withDiscount.length > 0
        ? withDiscount.reduce((a, b) => (b.discount > a.discount ? b : a))
        : null
      return {
        ...m,
        count: Math.max(mProducts.length, serverCounts?.[m.name] ?? 0),
        dealCount: withDiscount.length,
        bestDeal,
      }
    }).filter(m => m.count > 0)
  }, [products, serverCounts])

  if (marketStats.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
          Supermarkten &amp; Drogisterijen
        </h2>
        <span className="text-[11px] font-medium" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          {marketStats.length} winkels
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {marketStats.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="group"
          >
            <Link
              href={`/supermarkt/${m.slug}`}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'white',
                border: '1px solid rgba(228,190,183,0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                textDecoration: 'none',
                display: 'flex',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Market logo */}
              <div className="group-hover:scale-105 transition-transform rounded-xl overflow-hidden">
                <MarketLogo market={m.name} size={52} />
              </div>

              {/* Market name */}
              <span className="font-semibold text-[12px] text-center leading-tight" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
                {m.name}
              </span>

              {/* Stats */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
                  {m.count} deals
                </span>
                {m.bestDeal && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(27,158,75,0.1)', color: '#1B9E4B', fontFamily: 'JetBrains Mono' }}
                  >
                    -{m.bestDeal.discount}%
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
