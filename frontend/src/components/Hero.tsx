import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

interface HeroProps {
  onScrape: () => void
  isScraping: boolean
  totalSavings: number
  searchTerm: string
  onSearchChange: (val: string) => void
  productCount: number
}

export function Hero({ onScrape, isScraping, totalSavings, searchTerm, onSearchChange, productCount }: HeroProps) {
  const { t } = useLanguage()

  return (
    <section className="relative py-8 md:py-16 mb-12 overflow-hidden">
      {/* Decorative Warm Blobs */}
      <motion.div
        className="absolute -top-20 -right-10 w-[500px] h-[500px] rounded-full -z-0"
        style={{ background: 'radial-gradient(circle, rgba(227,61,38,0.06) 0%, transparent 70%)' }}
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-10 -left-20 w-[400px] h-[400px] rounded-full -z-0"
        style={{ background: 'radial-gradient(circle, rgba(212,168,85,0.08) 0%, transparent 70%)' }}
        animate={{ x: [0, -12, 0], y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10">
        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6"
          style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {t.weeklyDeals}
        </motion.span>

        {/* GIANT HEADING */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-headline font-bold leading-[0.9] tracking-tighter mb-10"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 9rem)',
            color: '#1A1A1A',
            letterSpacing: '-0.04em',
          }}
        >
          {t.heroTitle1}<br />
          <span style={{ color: '#E33D26' }}>{t.heroTitle2}</span>
        </motion.h1>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative max-w-2xl mb-10"
        >
          <span
            className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-xl"
            style={{ color: '#8C8478' }}
          >
            search
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-giant"
          />
        </motion.div>

        {/* Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-3 items-center"
        >
          {/* Scrape CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onScrape}
            disabled={isScraping}
            className="btn-pill btn-pill-primary flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {isScraping ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined">bolt</span>
            )}
            {isScraping ? t.scanning : t.scanBtn}
          </motion.button>

          {/* Product Count Stat */}
          {productCount > 0 && (
            <div className="stat-pill">
              <span className="material-symbols-outlined text-base" style={{ color: '#E33D26' }}>inventory_2</span>
              <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{productCount}</span>
              <span className="text-sm" style={{ color: '#8C8478' }}>{t.activeProducts}</span>
            </div>
          )}

          {/* Savings Stat */}
          {totalSavings > 0 && (
            <div className="stat-pill">
              <span className="material-symbols-outlined text-base" style={{ color: '#1B9E4B' }}>trending_down</span>
              <span className="text-sm" style={{ color: '#8C8478' }}>{t.savings}</span>
              <span className="text-sm font-bold font-headline" style={{ color: '#1B9E4B' }}>€{totalSavings.toFixed(2)}</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
