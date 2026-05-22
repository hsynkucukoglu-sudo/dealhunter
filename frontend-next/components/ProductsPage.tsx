'use client'
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { Product, CATEGORIES, CATEGORY_LABELS, MARKET_COLORS, getMarketInitial } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ShoppingListSidebar } from './ShoppingListSidebar'
import { AddProductForm } from './AddProductForm'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useShoppingList } from '@/context/ShoppingListContext'
import { useLanguage } from '@/context/LanguageContext'
import { DealHunterLogo } from './DealHunterLogo'
import { AdBanner } from './AdBanner'
import { buildComparisonGroups } from '@/lib/similarity'
import { parseProductMeta } from '@/lib/productMeta'
import { useFavorites } from '@/context/FavoritesContext'
import { PushNotificationButton } from './PushNotificationButton'
import { AuthButton } from './AuthButton'
import { detectCampaignType, CAMPAIGN_FILTERS, CampaignType } from '@/lib/campaignType'
import { StickyFilterBar } from './StickyFilterBar'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export function ProductsPage({ initialProducts, initialSearch = '' }: { initialProducts: Product[], initialSearch?: string }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isScraping, setIsScraping] = useState(false)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [showCampaignsOnly, setShowCampaignsOnly] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [navScrolled, setNavScrolled] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | 'all'>('all')
  const [watchlistToast, setWatchlistToast] = useState<string | null>(null)
  const [canInstall, setCanInstall] = useState(false)
const deferredPromptRef = useRef<Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null)

  const { itemCount, setIsCartOpen } = useShoppingList()
  const { t, lang } = useLanguage()
  const { favorites, watchlist } = useFavorites()

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!watchlist.length || !products.length) return
    const hits = watchlist.filter(w => products.some(p => p.id === w.id && p.discountedPrice <= w.discountedPrice))
    if (hits.length > 0) {
      setWatchlistToast(hits[0].name)
      setTimeout(() => setWatchlistToast(null), 5000)
    }
  }, [watchlist, products])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as typeof deferredPromptRef.current
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    if (window.matchMedia('(display-mode: standalone)').matches) setCanInstall(false)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 200)
    return () => clearTimeout(t)
  }, [searchTerm])

  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'brand', weight: 0.2 },
      { name: 'market', weight: 0.1 },
      { name: 'category', weight: 0.1 },
    ],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [products])

  const handleInstallPWA = async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      setCanInstall(false)
      deferredPromptRef.current = null
    }
  }

  const refreshProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`)
      const data = await res.json()
      if (data?.length) setProducts(data)
    } catch {}
  }

  const handleFetchFlyers = async () => {
    setIsScraping(true)
    try {
      const res = await fetch(`${API_BASE}/api/scraper/run`, { method: 'POST' })
      const result = await res.json()
      if (result.success) await refreshProducts()
    } catch {
      alert('Bültenleri çekerken bir sorun oluştu.')
    } finally {
      setIsScraping(false)
    }
  }

  const availableMarkets = useMemo(() =>
    Array.from(new Set(products.map(p => p.market))).sort()
  , [products])

  const filteredProducts = useMemo(() => {
    // Fuzzy-search candidate set (or full set when no query)
    const searchPool = debouncedSearch
      ? fuse.search(debouncedSearch).map(r => r.item)
      : products

    return searchPool.filter((p) => {
      const matchesCampaign = showCampaignsOnly ? p.isCampaign : true
      const matchesMarket = selectedMarket === 'all' || p.market === selectedMarket
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      const matchesFavorites = showFavoritesOnly ? favorites.some(f => f.id === p.id) : true
      const matchesCampaignType = (() => {
        if (selectedCampaign === 'all') return true
        const discountPct = p.originalPrice > p.discountedPrice && p.originalPrice > 0
          ? (p.discount || Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100))
          : 0
        return detectCampaignType(p.name, discountPct, p.campaignType).type === selectedCampaign
      })()
      return matchesCampaign && matchesMarket && matchesCategory && matchesFavorites && matchesCampaignType
    })
  }, [products, debouncedSearch, fuse, showCampaignsOnly, selectedMarket, selectedCategory, showFavoritesOnly, favorites, selectedCampaign])

  const potentialSavings = useMemo(() =>
    filteredProducts.reduce((sum, p) => sum + (p.originalPrice > p.discountedPrice ? p.originalPrice - p.discountedPrice : 0), 0)
  , [filteredProducts])

  const expiringSoon = useMemo(() =>
    products.filter(p => {
      if (!p.expiresAt) return false
      const diff = Math.ceil((new Date(p.expiresAt).getTime() - Date.now()) / 86400000)
      return diff >= 0 && diff <= 2
    }).slice(0, 8)
  , [products])

  const topDeals = useMemo(() => {
    // Strip size/count tokens to get a base product name for dedup
    const baseName = (name: string) =>
      name
        .replace(/\b\d+[,.]\d+\b|\b\d+[-\s]*(g|gr|kg|kilo|ml|cl|dl|l|liter|stuks?|stuk|pack|pak|pck|x|wasbeurten?|tabs?)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .toLowerCase()

    const discPct = (p: { originalPrice: number; discountedPrice: number; discount: number }) =>
      p.discount || Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100)

    // Find an existing group key with ≥75% token overlap (handles descriptor variants like "belegen")
    const findGroupKey = (map: Map<string, typeof products[number]>, key: string): string => {
      if (map.has(key)) return key
      const tokens = key.split(' ').filter(w => w.length > 1)
      for (const existing of map.keys()) {
        const eTokens = existing.split(' ').filter(w => w.length > 1)
        const overlap = tokens.filter(t => eTokens.includes(t)).length
        if (overlap >= 2 && overlap / Math.max(tokens.length, eTokens.length) >= 0.75) return existing
      }
      return key
    }

    // One best deal per base product name — highest discount%, tie-break: lowest unit price
    const byBase = new Map<string, typeof products[number]>()
    for (const p of products) {
      if (!(p.originalPrice > p.discountedPrice) || !p.discount) continue
      const key = findGroupKey(byBase, baseName(p.name))
      const existing = byBase.get(key)
      if (!existing) {
        byBase.set(key, p)
      } else {
        const pPct = discPct(p)
        const ePct = discPct(existing)
        if (pPct > ePct) {
          byBase.set(key, p)
        } else if (pPct === ePct) {
          const pMeta = parseProductMeta(p.name, p.discountedPrice)
          const eMeta = parseProductMeta(existing.name, existing.discountedPrice)
          const pUnit = (p.unitPrice ?? pMeta.unitPrice) ?? p.discountedPrice
          const eUnit = (existing.unitPrice ?? eMeta.unitPrice) ?? existing.discountedPrice
          if (pUnit < eUnit) byBase.set(key, p)
        }
      }
    }

    return [...byBase.values()]
      .sort((a, b) => discPct(b) - discPct(a))
      .slice(0, 5)
  }, [products])

  const comparisonGroups = useMemo(() => buildComparisonGroups(products), [products])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      {/* WATCHLIST TOAST */}
      <AnimatePresence>
        {watchlistToast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-full text-sm font-bold shadow-lg"
            style={{ background: '#FF8C00', color: 'white', whiteSpace: 'nowrap' }}
          >
            🔔 {watchlistToast} — {lang === 'tr' ? 'hâlâ satışta!' : lang === 'en' ? 'still on sale!' : 'nog steeds in aanbieding!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING PILL NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`fixed top-4 left-4 right-4 z-50 flex justify-between items-center px-4 md:px-6 h-14 rounded-full transition-all duration-300 ${navScrolled ? 'navbar-pill' : 'bg-transparent'}`}
        style={navScrolled ? {} : { border: 'none', boxShadow: 'none' }}
      >
        <div className="flex items-center gap-6">
          <DealHunterLogo height={36} />

          <div className="hidden md:flex gap-1 items-center">
            <button
              onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(false); setSelectedCategory('all'); setSelectedCampaign('all') }}
              className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-black/5"
              style={{ color: '#1A1A1A' }}
            >
              {t.scanBtn}
            </button>
            <button
              onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(true); setSelectedCategory('all'); setSelectedCampaign('all') }}
              className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-black/5"
              style={{ color: '#6B6259' }}
            >
              {t.campaignsOnly}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {navScrolled && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden sm:flex items-center overflow-hidden"
              >
                <div className="flex items-center bg-black/5 rounded-full px-3 py-1.5 gap-2 w-full">
                  <span className="material-symbols-outlined text-sm" style={{ color: '#8C8478' }}>search</span>
                  <input
                    type="text" placeholder="Ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full"
                    style={{ color: '#1A1A1A' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PushNotificationButton />
          <AuthButton />

          <AnimatePresence>
            {canInstall && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleInstallPWA}
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer"
                style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
              >
                <span className="material-symbols-outlined text-base">install_mobile</span>
                Yükle
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleFetchFlyers}
            disabled={isScraping}
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
            style={{ background: '#1A1A1A', color: 'white', fontFamily: 'Space Grotesk' }}
          >
            {isScraping
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-base">refresh</span>}
            {isScraping ? t.scanning : t.scanBtn}
          </motion.button>

          <LanguageSwitcher />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer p-2 rounded-full transition-all hover:bg-black/5"
          >
            <span className="material-symbols-outlined" style={{ color: '#1A1A1A' }}>shopping_bag</span>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key="cart-count"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 text-[10px] font-bold px-1.5 rounded-full"
                  style={{ background: '#E33D26', color: 'white' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      <StickyFilterBar
        show={navScrolled}
        availableMarkets={availableMarkets}
        selectedMarket={selectedMarket}
        selectedCategory={selectedCategory}
        lang={lang}
        onMarket={(m) => { setSelectedMarket(m); setShowCampaignsOnly(false) }}
        onCategory={setSelectedCategory}
        onClearAll={() => { setSelectedMarket('all'); setSelectedCategory('all'); setShowCampaignsOnly(false); setSelectedCampaign('all') }}
      />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-32">

        {/* HERO */}
        <section className="relative py-8 md:py-16 mb-12 overflow-hidden">
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
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6"
              style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {t.weeklyDeals}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-headline font-bold leading-[0.9] tracking-tighter mb-10"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', color: '#1A1A1A', letterSpacing: '-0.04em' }}
            >
              {t.heroTitle1}<br />
              <span style={{ color: '#E33D26' }}>{t.heroTitle2}</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="relative max-w-2xl mb-10"
            >
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-xl" style={{ color: '#8C8478' }}>search</span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-giant"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
                  style={{ background: 'rgba(139,132,120,0.15)' }}
                >
                  <span className="material-symbols-outlined text-base" style={{ color: '#8C8478' }}>close</span>
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFetchFlyers}
                disabled={isScraping}
                className="btn-pill btn-pill-primary flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {isScraping
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined">bolt</span>}
                {isScraping ? t.scanning : t.scanBtn}
              </motion.button>

              {filteredProducts.length > 0 && (
                <div className="stat-pill">
                  <span className="material-symbols-outlined text-base" style={{ color: '#E33D26' }}>inventory_2</span>
                  <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{filteredProducts.length}</span>
                  <span className="text-sm" style={{ color: '#8C8478' }}>{t.activeProducts}</span>
                </div>
              )}

              {potentialSavings > 0 && (
                <div className="stat-pill">
                  <span className="material-symbols-outlined text-base" style={{ color: '#1B9E4B' }}>trending_down</span>
                  <span className="text-sm" style={{ color: '#8C8478' }}>{t.savings}</span>
                  <span className="text-sm font-bold font-headline" style={{ color: '#1B9E4B' }}>€{potentialSavings.toFixed(2)}</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* SON GEÇERLİLİK TARİHİ UYARISI */}
        {expiringSoon.length > 0 && searchTerm === '' && selectedMarket === 'all' && selectedCategory === 'all' && !showCampaignsOnly && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined material-filled animate-pulse" style={{ color: '#E33D26' }}>alarm</span>
              <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                {lang === 'tr' ? 'Son Geçerlilik Tarihi' : lang === 'en' ? 'Expiring Soon' : 'Verloopt Binnenkort'}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#E33D26', color: 'white' }}>
                {lang === 'tr' ? 'Son 2 gün!' : lang === 'en' ? 'Last 2 days!' : 'Laatste 2 dagen!'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {expiringSoon.map((product, i) => {
                const daysLeft = Math.ceil((new Date(product.expiresAt).getTime() - Date.now()) / 86400000)
                const isToday = daysLeft === 0
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    style={{
                      borderRadius: '24px',
                      outline: `2px solid ${isToday ? '#E33D26' : '#FF8C00'}`,
                      outlineOffset: '-2px',
                      boxShadow: isToday
                        ? '0 0 20px rgba(227,61,38,0.18)'
                        : '0 0 14px rgba(255,140,0,0.14)',
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* TOP 5 DEALS */}
        {topDeals.length > 0 && searchTerm === '' && selectedMarket === 'all' && selectedCategory === 'all' && !showCampaignsOnly && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined material-filled" style={{ color: '#E33D26' }}>local_fire_department</span>
              <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                {lang === 'tr' ? 'En İyi 5 Fırsat' : lang === 'en' ? 'Top 5 Deals' : 'Top 5 Beste Deals'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {topDeals.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* PRIJSVERGELIJKING */}
        {comparisonGroups.length > 0 && searchTerm === '' && selectedMarket === 'all' && selectedCategory === 'all' && !showCampaignsOnly && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined material-filled" style={{ color: '#1B9E4B' }}>compare_arrows</span>
              <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                {lang === 'tr' ? 'Fiyat Karşılaştırma' : lang === 'en' ? 'Price Comparison' : 'Prijsvergelijking'}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {comparisonGroups.map((group, gi) => (
                <motion.div
                  key={gi}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  transition={{ duration: 0.3, delay: gi * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(201,193,182,0.4)' }}
                >
                  {(() => {
                    // Pack size label — same for all products in the group
                    const rep = group.products[0]
                    const repMeta = parseProductMeta(rep.name, rep.discountedPrice)
                    const packLabel = rep.fullSizeLabel
                      ?? (rep.unitSize != null && rep.unitType ? `${rep.unitSize} ${rep.unitType}` : null)
                      ?? repMeta.fullSizeLabel
                    return (
                      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(201,193,182,0.3)' }}>
                        <p className="font-headline font-bold text-sm" style={{ color: '#1A1A1A' }}>{group.name}</p>
                        {packLabel && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-none"
                            style={{ background: '#EAE4DE', color: '#6B6259' }}
                          >
                            {packLabel}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  <div className="divide-y" style={{ borderColor: 'rgba(201,193,182,0.2)' }}>
                    {group.products
                      .slice()
                      .sort((a, b) => {
                        const ma = parseProductMeta(a.name, a.discountedPrice)
                        const mb = parseProductMeta(b.name, b.discountedPrice)
                        const sa = (a.unitPrice ?? ma.unitPrice) ?? a.discountedPrice
                        const sb = (b.unitPrice ?? mb.unitPrice) ?? b.discountedPrice
                        return sa - sb
                      })
                      .map(p => {
                        const meta = parseProductMeta(p.name, p.discountedPrice)
                        const unitPriceDisplay = p.unitPrice != null && p.unitType
                          ? `€${p.unitPrice.toFixed(2)} / ${p.unitType === 'ml' ? (p.unitSize != null && p.unitSize >= 1000 ? 'L' : '100ml') : p.unitType === 'g' ? (p.unitSize != null && p.unitSize >= 500 ? 'kg' : '100g') : 'stuk'}`
                          : meta.unitPriceDisplay?.display ?? null
                        const isCheapest = p.id === group.cheapest.id
                        return (
                          <div key={p.id} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: MARKET_COLORS[p.market] || '#8C8478' }} />
                              <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{p.market}</span>
                              {isCheapest && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-none" style={{ background: '#1B9E4B', color: 'white' }}>
                                  {lang === 'tr' ? 'En ucuz' : lang === 'en' ? 'Cheapest' : 'Goedkoopst'}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5 ml-3">
                              <span className="text-lg font-headline font-black leading-none" style={{ color: isCheapest ? '#1B9E4B' : '#1A1A1A' }}>
                                €{p.discountedPrice.toFixed(2)}
                              </span>
                              {unitPriceDisplay && (
                                <span className="text-[11px] font-medium" style={{ color: '#9C9389' }}>
                                  {unitPriceDisplay}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* AD — Hero altı */}
        <AdBanner slot="5913072775" format="horizontal" className="mb-10" />

        {/* CATEGORY VIEW / HOME VIEW */}
        <AnimatePresence mode="wait">
          {selectedCategory !== 'all' ? (
            <motion.div key={selectedCategory} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-4 mb-8">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCategory('all')}
                  className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(201,193,182,0.5)' }}
                >
                  <span className="material-symbols-outlined text-lg" style={{ color: '#1A1A1A' }}>arrow_back</span>
                </motion.button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                    {(() => { const cat = CATEGORIES.find(c => c.id === selectedCategory); return cat ? `${cat.emoji} ${CATEGORY_LABELS[cat.id]?.[lang] ?? cat.label}` : '' })()}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: '#8C8478' }}>{filteredProducts.length} {t.activeProducts}</p>
                </div>
              </div>

              {availableMarkets.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mb-8">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMarket('all')}
                    className={`market-pill ${selectedMarket === 'all' ? 'market-pill-active' : ''}`}
                  >
                    <span className="material-symbols-outlined text-base">bolt</span>
                    {t.allMarkets}
                  </motion.button>
                  <div className="w-px h-6 flex-none" style={{ background: '#C9C1B6' }} />
                  {availableMarkets.map(market => (
                    <motion.button
                      key={market}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMarket(market)}
                      className={`market-pill ${selectedMarket === market ? 'market-pill-active' : ''}`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                        style={{ background: MARKET_COLORS[market] || '#6B6259' }}>
                        {getMarketInitial(market)}
                      </div>
                      {market}
                    </motion.button>
                  ))}
                </div>
              )}

              <ProductGrid products={filteredProducts} t={t} searchTerm={debouncedSearch} />
            </motion.div>
          ) : (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Category Grid */}
              <section className="mb-12">
                <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>{lang === 'tr' ? 'Kategoriler' : lang === 'en' ? 'Categories' : 'Categorieën'}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CATEGORIES.map(cat => {
                    const count = products.filter(p => p.category === cat.id).length
                    return (
                      <motion.button
                        key={cat.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col items-start p-4 rounded-2xl cursor-pointer transition-all text-left"
                        style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(201,193,182,0.4)' }}
                      >
                        <span className="text-2xl mb-2">{cat.emoji}</span>
                        <span className="text-sm font-semibold leading-tight" style={{ color: '#1A1A1A' }}>
                          {CATEGORY_LABELS[cat.id]?.[lang] ?? cat.label}
                        </span>
                        <span className="text-xs mt-1" style={{ color: '#8C8478' }}>{count} {lang === 'tr' ? 'ürün' : lang === 'en' ? 'deals' : 'aanbiedingen'}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </section>

              {/* Campaign Type Filter Chips */}
              <section className="mb-6 -mt-6">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  {CAMPAIGN_FILTERS.map(f => (
                    <motion.button
                      key={f.type}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCampaign(f.type === selectedCampaign ? 'all' : f.type)}
                      className={`market-pill flex-none ${selectedCampaign === f.type ? 'market-pill-active' : ''}`}
                    >
                      <span>{f.emoji}</span>
                      {f.label}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* AD — Kategori altı */}
              <AdBanner slot="5913072775" format="auto" className="mb-10" />

              {/* Market Pills */}
              {availableMarkets.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(false); setSelectedCampaign('all') }}
                      className={`market-pill ${selectedMarket === 'all' && !showCampaignsOnly ? 'market-pill-active' : ''}`}>
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {t.allMarkets}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(true); setSelectedCampaign('all') }}
                      className={`market-pill ${showCampaignsOnly ? 'market-pill-active' : ''}`}>
                      <span className="material-symbols-outlined text-base">local_fire_department</span>
                      {t.campaignsOnly}
                    </motion.button>
                    {favorites.length > 0 && (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`market-pill ${showFavoritesOnly ? 'market-pill-active' : ''}`}>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: showFavoritesOnly ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
                        {lang === 'tr' ? 'Favoriler' : lang === 'en' ? 'Favorites' : 'Favorieten'} ({favorites.length})
                      </motion.button>
                    )}
                    <div className="w-px h-6 flex-none" style={{ background: '#C9C1B6' }} />
                    {availableMarkets.map(market => (
                      <motion.button key={market} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedMarket(market); setShowCampaignsOnly(false) }}
                        className={`market-pill ${selectedMarket === market && !showCampaignsOnly ? 'market-pill-active' : ''}`}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                          style={{ background: MARKET_COLORS[market] || '#6B6259' }}>
                          {getMarketInitial(market)}
                        </div>
                        {market}
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}

              {/* Product Grid */}
              <section>
                <div className="flex items-baseline justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                      {selectedCampaign !== 'all'
                        ? (CAMPAIGN_FILTERS.find(f => f.type === selectedCampaign)?.label ?? t.scanBtn)
                        : selectedMarket === 'all' ? (showCampaignsOnly ? t.campaignsOnly : t.scanBtn) : selectedMarket}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#8C8478' }}>{filteredProducts.length} {t.activeProducts}</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCampaignsOnly(!showCampaignsOnly)}
                    className="p-2 rounded-full transition-all cursor-pointer"
                    style={{ background: showCampaignsOnly ? '#E33D26' : 'rgba(0,0,0,0.04)', color: showCampaignsOnly ? 'white' : '#6B6259' }}>
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </motion.button>
                </div>

                <ProductGrid products={filteredProducts} t={t} searchTerm={debouncedSearch} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BOTTOM MOBILE NAV */}
      <nav
        className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 z-50 md:hidden"
        style={{
          background: 'rgba(245, 237, 227, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(201, 193, 182, 0.4)',
        }}
      >
        <button
          onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(false); setSelectedCategory('all'); setSelectedCampaign('all') }}
          className="flex flex-col items-center justify-center p-2 cursor-pointer rounded-2xl"
          style={{ background: '#E33D26', color: 'white', marginTop: '-12px', boxShadow: '0 4px 16px rgba(227,61,38,0.3)' }}
        >
          <span className="material-symbols-outlined">bolt</span>
          <span className="font-headline text-[10px] font-bold uppercase">Fırsatlar</span>
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer relative"
          style={{ color: '#6B6259' }}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-headline text-[10px] font-bold uppercase">Sepetim</span>
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 text-[9px] font-bold px-1 rounded-full" style={{ background: '#E33D26', color: 'white' }}>
              {itemCount}
            </span>
          )}
        </button>
        <button
          onClick={handleFetchFlyers}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
          style={{ color: '#6B6259' }}
        >
          <span className="material-symbols-outlined">refresh</span>
          <span className="font-headline text-[10px] font-bold uppercase">Tara</span>
        </button>
        <button
          onClick={() => setShowCampaignsOnly(!showCampaignsOnly)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
          style={{ color: showCampaignsOnly ? '#E33D26' : '#6B6259' }}
        >
          <span className="material-symbols-outlined">local_fire_department</span>
          <span className="font-headline text-[10px] font-bold uppercase">Kampanya</span>
        </button>
      </nav>

      <ShoppingListSidebar />
      <AddProductForm onAdded={refreshProducts} />

      <footer style={{ textAlign: 'center', padding: '32px 24px', marginTop: 40, borderTop: '1px solid #F0E6DE', fontSize: 13, color: '#888' }}>
        <div style={{ marginBottom: 12 }}>
          <a href="/privacy" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Privacybeleid</a>
          <a href="/contact" style={{ color: '#E33D26', textDecoration: 'none' }}>Contact</a>
        </div>
        <div>© {new Date().getFullYear()} DealHunter4U — Alle supermarkt aanbiedingen op één plek</div>
        <div style={{ marginTop: 8 }}>
          <a href="/blog" style={{ color: '#8C8478', textDecoration: 'none', marginRight: 16 }}>Blog</a>
        </div>
      </footer>
    </div>
  )
}

const AD_INTERVAL = 12

function ProductGrid({ products, t, searchTerm = '' }: { products: Product[]; t: { noProducts: string; noProductsDesc: string }; searchTerm?: string }) {
  if (products.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 rounded-3xl px-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
        <p className="text-xl font-headline font-bold mb-2" style={{ color: '#1A1A1A' }}>{t.noProducts}</p>
        <p className="max-w-md mx-auto text-sm mb-6" style={{ color: '#8C8478' }}>{t.noProductsDesc}</p>
        {searchTerm && (
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-sm font-medium" style={{ color: '#6B6259' }}>
              <span style={{ color: '#E33D26' }}>"{searchTerm}"</span> şu an indirimde değil
            </p>
            <a
              href="/api/auth/signin"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{ background: '#E33D26', color: 'white' }}
            >
              <span className="material-symbols-outlined text-base">notifications</span>
              Fiyatı düşünce haber ver
            </a>
          </div>
        )}
      </motion.div>
    )
  }

  const rows: React.ReactNode[] = []
  products.forEach((product, index) => {
    rows.push(
      <motion.div key={product.id}
        initial={{ opacity: 0, y: index < 8 ? 20 : 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -40px 0px' }}
        transition={{ duration: 0.3, delay: index < 8 ? index * 0.04 : 0 }}>
        <ProductCard product={product} />
      </motion.div>
    )
    if ((index + 1) % AD_INTERVAL === 0 && index + 1 < products.length) {
      rows.push(
        <div key={`ad-${index}`} className="col-span-2 lg:col-span-3 xl:col-span-4">
          <AdBanner slot="5913072775" format="auto" className="my-2" />
        </div>
      )
    }
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {rows}
    </motion.div>
  )
}
