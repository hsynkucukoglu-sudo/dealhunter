'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Product, VISIBLE_MARKETS } from '@/lib/types'

interface Props {
  products: Product[]
  onSelectMarket: (market: string) => void
}

export function MarktenShowcase({ products, onSelectMarket }: Props) {
  const marketStats = useMemo(() => {
    return VISIBLE_MARKETS.map(m => {
      const mProducts = products.filter(p => p.market === m.name)
      const withDiscount = mProducts.filter(p => p.originalPrice > p.discountedPrice && p.discount > 0)
      const bestDeal = withDiscount.length > 0
        ? withDiscount.reduce((a, b) => (b.discount > a.discount ? b : a))
        : null
      return {
        ...m,
        count: mProducts.length,
        dealCount: withDiscount.length,
        bestDeal,
      }
    }).filter(m => m.count > 0)
  }, [products])

  if (marketStats.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
          🏪 Supermarkten &amp; Drogisterijen
        </h2>
        <span className="text-xs font-medium" style={{ color: '#8C8478' }}>
          {marketStats.length} winkels
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {marketStats.map((m, i) => (
          <motion.button
            key={m.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectMarket(m.name)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-left cursor-pointer transition-all hover:shadow-md group"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(201,193,182,0.35)',
            }}
          >
            {/* Market avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: m.color }}
            >
              {m.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Market name */}
            <span className="font-bold text-sm text-center leading-tight" style={{ color: '#1A1A1A' }}>
              {m.name}
            </span>

            {/* Stats */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-medium" style={{ color: '#8C8478' }}>
                {m.count} aanbiedingen
              </span>
              {m.bestDeal && (
                <span
                  className="text-[11px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: '#E8F5EC', color: '#1B9E4B' }}
                >
                  tot -{m.bestDeal.discount}%
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
