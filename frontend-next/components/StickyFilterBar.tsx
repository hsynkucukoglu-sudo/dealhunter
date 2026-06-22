'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { MARKET_COLORS, CATEGORIES, CATEGORY_LABELS } from '@/lib/types'
import { MarketLogo } from './MarketLogo'

const SHORT_NAMES: Record<string, string> = {
  'Albert Heijn': 'AH',
  'DekaMarkt':    'Deka',
  'Hoogvliet':    'Hoog',
  'Kruidvat':     'Krdt',
}
function shortName(market: string): string {
  return SHORT_NAMES[market] ?? market
}

interface Props {
  show: boolean
  availableMarkets: string[]
  selectedMarket: string
  selectedCategory: string
  lang: string
  onMarket: (m: string) => void
  onCategory: (c: string) => void
  onClearAll: () => void
}

export function StickyFilterBar({
  show,
  availableMarkets,
  selectedMarket,
  selectedCategory,
  lang,
  onMarket,
  onCategory,
  onClearAll,
}: Props) {
  const hasActiveFilter = selectedMarket !== 'all' || selectedCategory !== 'all'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed left-0 right-0 z-40 md:hidden"
          style={{
            top: 72,
            background: 'rgba(245, 237, 227, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(201,193,182,0.4)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Market row */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pt-2 pb-1.5">
            <button
              onClick={() => onMarket('all')}
              className="flex-none flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                background: selectedMarket === 'all' ? '#1A1A1A' : 'rgba(0,0,0,0.06)',
                color: selectedMarket === 'all' ? 'white' : '#6B6259',
              }}
            >
              Alles
            </button>
            {availableMarkets.map(market => (
              <button
                key={market}
                onClick={() => onMarket(selectedMarket === market ? 'all' : market)}
                className="flex-none flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: selectedMarket === market
                    ? (MARKET_COLORS[market] || '#1A1A1A')
                    : 'rgba(0,0,0,0.06)',
                  color: selectedMarket === market ? 'white' : '#6B6259',
                }}
              >
                <MarketLogo market={market} size={18} />
                {shortName(market)}
              </button>
            ))}
          </div>

          {/* Category row */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                className="flex-none flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: selectedCategory === cat.id ? '#E33D26' : 'rgba(0,0,0,0.05)',
                  color: selectedCategory === cat.id ? 'white' : '#8C8478',
                }}
              >
                <span>{cat.emoji}</span>
                {CATEGORY_LABELS[cat.id]?.[lang] ?? cat.label}
              </button>
            ))}
          </div>

          {/* Active filter indicator + clear */}
          <AnimatePresence>
            {hasActiveFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 px-3 pb-2 overflow-hidden"
              >
                <span className="text-[11px]" style={{ color: '#9C9389' }}>
                  {[
                    selectedMarket !== 'all' ? selectedMarket : null,
                    selectedCategory !== 'all'
                      ? (CATEGORY_LABELS[selectedCategory]?.[lang] ?? selectedCategory)
                      : null,
                  ].filter(Boolean).join(' · ')}
                </span>
                <button
                  onClick={onClearAll}
                  className="ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(227,61,38,0.1)', color: '#E33D26' }}
                >
                  <span className="material-symbols-outlined text-xs leading-none">close</span>
                  Wis
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
