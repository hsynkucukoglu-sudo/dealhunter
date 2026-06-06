'use client'
import React, { useState, useMemo, useEffect, useRef, useCallback, useTransition, useDeferredValue } from 'react'
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
import { NewsletterSignup } from './NewsletterSignup'
import { trackMarketFilter, trackCategoryFilter, trackCampaignFilter, trackSearch, trackPwaInstall } from '@/lib/analytics'
import { MarketIndexWidget } from './MarketIndexWidget'
import { CombinatieDealsWidget } from './CombinatieDealsWidget'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export function ProductsPage({ initialProducts, initialSearch = '' }: { initialProducts: Product[], initialSearch?: string }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [fetchError, setFetchError] = useState(false)
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

  const [isPending, startTransition] = useTransition()

  // Deferred values keep filter button clicks instant (INP fix)
  // — heavy filteredProducts computation runs after paint
  const deferredMarket = useDeferredValue(selectedMarket)
  const deferredCategory = useDeferredValue(selectedCategory)
  const deferredCampaignsOnly = useDeferredValue(showCampaignsOnly)
  const deferredFavoritesOnly = useDeferredValue(showFavoritesOnly)
  const deferredCampaign = useDeferredValue(selectedCampaign)
  const deferredSearch = useDeferredValue(debouncedSearch)

  const { itemCount, setIsCartOpen } = useShoppingList()
  const { t, lang } = useLanguage()
  const { favorites, watchlist } = useFavorites()

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // SSR'da sadece top 60 ürün gelir; mount sonrası tüm ürünleri çek
  useEffect(() => {
    refreshProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const t = setTimeout(() => {
      const trimmed = searchTerm.trim()
      setDebouncedSearch(trimmed)
      if (trimmed.length >= 2) trackSearch(trimmed, filteredProducts.length)
    }, 500)
    return () => clearTimeout(t)
  }, [searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

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
    trackPwaInstall()
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      setCanInstall(false)
      deferredPromptRef.current = null
    }
  }

  const refreshProducts = async () => {
    setFetchError(false)
    try {
      const res = await fetch(`${API_BASE}/api/products`)
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (e) {
      console.error('Failed to refresh products:', e)
      setFetchError(true)
    }
  }

  const handleFetchFlyers = async () => {
    setIsScraping(true)
    try {
      await fetch(`${API_BASE}/api/scraper/run`, { method: 'POST' })
      // Scraper arka planda çalışıyor — bitmesini bekle
      const poll = async () => {
        try {
          const s = await fetch(`${API_BASE}/api/status`)
          const { scraperRunning: running } = await s.json()
          if (running) {
            setTimeout(poll, 4000)
          } else {
            await refreshProducts()
            setIsScraping(false)
          }
        } catch {
          setIsScraping(false)
        }
      }
      setTimeout(poll, 4000)
    } catch {
      setIsScraping(false)
    }
  }

  const availableMarkets = useMemo(() =>
    Array.from(new Set(products.map(p => p.market))).sort()
  , [products])

  const filteredProducts = useMemo(() => {
    // Use deferred values so filter button clicks feel instant
    const searchPool = deferredSearch
      ? fuse.search(deferredSearch).map(r => r.item)
      : products

    return searchPool.filter((p) => {
      const matchesCampaign = deferredCampaignsOnly ? p.isCampaign : true
      const matchesMarket = deferredMarket === 'all' || p.market === deferredMarket
      const matchesCategory = deferredCategory === 'all' || p.category === deferredCategory
      const matchesFavorites = deferredFavoritesOnly ? favorites.some(f => f.id === p.id || (f.name === p.name && f.market === p.market)) : true
      const matchesCampaignType = (() => {
        if (deferredCampaign === 'all') return true
        const discountPct = p.originalPrice > p.discountedPrice && p.originalPrice > 0
          ? (p.discount || Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100))
          : 0
        return detectCampaignType(p.name, discountPct, p.campaignType).type === deferredCampaign
      })()
      return matchesCampaign && matchesMarket && matchesCategory && matchesFavorites && matchesCampaignType
    }).sort((a, b) => {
      const pctA = a.originalPrice > a.discountedPrice && a.originalPrice > 0
        ? (a.discount || Math.round(((a.originalPrice - a.discountedPrice) / a.originalPrice) * 100))
        : 0
      const pctB = b.originalPrice > b.discountedPrice && b.originalPrice > 0
        ? (b.discount || Math.round(((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100))
        : 0
      return pctB - pctA
    })
  }, [products, deferredSearch, fuse, deferredCampaignsOnly, deferredMarket, deferredCategory, deferredFavoritesOnly, favorites, deferredCampaign])

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
              onClick={() => startTransition(() => { setSelectedMarket('all'); setShowCampaignsOnly(false); setSelectedCategory('all'); setSelectedCampaign('all') })}
              className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-black/5"
              style={{ color: '#1A1A1A' }}
            >
              {t.scanBtn}
            </button>
            <button
              onClick={() => startTransition(() => { setSelectedMarket('all'); setShowCampaignsOnly(true); setSelectedCategory('all'); setSelectedCampaign('all') })}
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
        onMarket={(m) => startTransition(() => { setSelectedMarket(m); setShowCampaignsOnly(false) })}
        onCategory={(c) => startTransition(() => setSelectedCategory(c))}
        onClearAll={() => startTransition(() => { setSelectedMarket('all'); setSelectedCategory('all'); setShowCampaignsOnly(false); setSelectedCampaign('all') })}
      />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-32">

        {/* MARKET BAR — hero'nun üstünde */}
        {availableMarkets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => startTransition(() => { setSelectedMarket('all'); setShowCampaignsOnly(false); setSelectedCampaign('all'); setSelectedCategory('all') })}
              className={`market-pill flex-none ${selectedMarket === 'all' && !showCampaignsOnly ? 'market-pill-active' : ''}`}>
              <span className="material-symbols-outlined text-base">bolt</span>
              {t.allMarkets}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => startTransition(() => { setSelectedMarket('all'); setShowCampaignsOnly(true); setSelectedCampaign('all'); setSelectedCategory('all') })}
              className={`market-pill flex-none ${showCampaignsOnly ? 'market-pill-active' : ''}`}>
              <span className="material-symbols-outlined text-base">local_fire_department</span>
              {t.campaignsOnly}
            </motion.button>
            {favorites.length > 0 && (
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => startTransition(() => setShowFavoritesOnly(!showFavoritesOnly))}
                className={`market-pill flex-none ${showFavoritesOnly ? 'market-pill-active' : ''}`}>
                <span className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: showFavoritesOnly ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
                {lang === 'tr' ? 'Favoriler' : lang === 'en' ? 'Favorites' : 'Favorieten'}
              </motion.button>
            )}
            <div className="w-px h-6 flex-none" style={{ background: '#C9C1B6' }} />
            {availableMarkets.map(market => (
              <motion.button key={market} whileTap={{ scale: 0.95 }}
                onClick={() => { trackMarketFilter(market); startTransition(() => { setSelectedMarket(market); setShowCampaignsOnly(false); setSelectedCategory('all') }) }}
                className={`market-pill flex-none ${selectedMarket === market && !showCampaignsOnly ? 'market-pill-active' : ''}`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                  style={{ background: MARKET_COLORS[market] || '#6B6259' }}>
                  {getMarketInitial(market)}
                </div>
                {market}
              </motion.button>
            ))}
          </div>
        )}

        {/* CATEGORY FILTER BAR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { trackCategoryFilter('all'); startTransition(() => setSelectedCategory('all')) }}
            className={`market-pill flex-none ${selectedCategory === 'all' ? 'market-pill-active' : ''}`}>
            <span className="material-symbols-outlined text-base">apps</span>
            {lang === 'tr' ? 'Tümü' : lang === 'en' ? 'All' : 'Alle'}
          </motion.button>
          {CATEGORIES.map(cat => (
            <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
              onClick={() => { trackCategoryFilter(cat.id); startTransition(() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)) }}
              className={`market-pill flex-none ${selectedCategory === cat.id ? 'market-pill-active' : ''}`}>
              <span>{cat.emoji}</span>
              {CATEGORY_LABELS[cat.id]?.[lang] ?? cat.label}
            </motion.button>
          ))}
        </div>

        {/* CAMPAIGN FILTER BAR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {CAMPAIGN_FILTERS.map(f => (
            <motion.button
              key={f.type}
              whileTap={{ scale: 0.95 }}
              onClick={() => { const next = f.type === selectedCampaign ? 'all' : f.type; if (next !== 'all' && next != null) trackCampaignFilter(String(next)); startTransition(() => setSelectedCampaign(next)) }}
              className={`market-pill flex-none ${selectedCampaign === f.type ? 'market-pill-active' : ''}`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* PRIJSVERGELIJKING BAR — hero'nun üstünde, yatay scroll */}
        {comparisonGroups.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            <div className="flex items-center gap-1 mr-1 flex-none">
              <span className="material-symbols-outlined text-sm" style={{ color: '#1B9E4B' }}>compare_arrows</span>
              <span className="text-[11px] font-bold uppercase tracking-wide flex-none" style={{ color: '#8C8478' }}>
                {lang === 'tr' ? 'Karşılaştır' : lang === 'en' ? 'Compare' : 'Vergelijk'}
              </span>
            </div>
            <div className="w-px h-5 flex-none" style={{ background: '#C9C1B6' }} />
            {comparisonGroups.map((group, gi) => {
              const cheapest = group.cheapest
              const mostExpensive = group.products.reduce((a, b) => a.discountedPrice > b.discountedPrice ? a : b)
              const saving = mostExpensive.discountedPrice - cheapest.discountedPrice
              return (
                <div
                  key={gi}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-none cursor-default"
                  style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(201,193,182,0.4)' }}
                >
                  <div className="w-2 h-2 rounded-full flex-none" style={{ background: MARKET_COLORS[cheapest.market] || '#1B9E4B' }} />
                  <span className="text-xs font-semibold max-w-[120px] truncate" style={{ color: '#1A1A1A' }}>{group.name}</span>
                  <span className="text-xs font-black" style={{ color: '#1B9E4B' }}>€{cheapest.discountedPrice.toFixed(2)}</span>
                  {saving > 0.01 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none" style={{ background: '#E8F5EC', color: '#1B9E4B' }}>
                      -{saving.toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

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
              initial={{ y: 8 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6"
              style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {t.weeklyDeals}
            </motion.span>

            {/* h1 starts fully visible — no opacity:0 so LCP is measured immediately */}
            <h1
              className="font-headline font-bold leading-[0.9] tracking-tighter mb-10"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', color: '#1A1A1A', letterSpacing: '-0.04em' }}
            >
              {t.heroTitle1}<br />
              <span style={{ color: '#E33D26' }}>{t.heroTitle2}</span>
            </h1>

            <motion.div
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
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

            {/* POPULAIRE ZOEKOPDRACHTEN */}
            {!searchTerm && (
              <div className="flex flex-wrap items-center gap-2 mb-6 -mt-6">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9C9389' }}>
                  Populair:
                </span>
                {['Coca-Cola', 'Pampers', 'Ariel', 'Hertog Jan', 'Grolsch', 'Robijn', 'Douwe Egberts'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.8)', color: '#1A1A1A', border: '1px solid rgba(201,193,182,0.5)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* TRUST BADGES */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: 'storefront', text: '8 supermarkten vergeleken' },
                { icon: 'update', text: 'Dagelijks bijgewerkt' },
                { icon: 'lock_open', text: 'Gratis — geen account nodig' },
                { icon: 'euro', text: 'Tot 70% besparen' },
              ].map(b => (
                <div key={b.icon} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.7)', color: '#1A1A1A', border: '1px solid rgba(201,193,182,0.4)' }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: '#E33D26' }}>{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
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

              {/* WhatsApp CTA */}
              <a
                href="https://chat.whatsapp.com/C4Q20ugQTIYKdY4ZCeNqL2"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill flex items-center gap-2.5"
                style={{ background: '#25D366', color: 'white' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Word lid van onze groep
              </a>

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
            </div>
          </div>
        </section>

        {/* MARKET INDEX WIDGET */}
        {searchTerm === '' && selectedMarket === 'all' && selectedCategory === 'all' && !showCampaignsOnly && (
          <MarketIndexWidget products={products} />
        )}

        {/* COMBINATIE DEALS WIDGET */}
        {searchTerm === '' && selectedMarket === 'all' && selectedCategory === 'all' && !showCampaignsOnly && (
          <CombinatieDealsWidget products={products} />
        )}

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

        {/* AD — Hero altı */}
        <AdBanner slot="7882410354" format="horizontal" className="mb-10" minHeight={90} />

        {/* ANA LAYOUT: sol içerik + sağ Prijsvergelijking sidebar */}
        <div className="flex gap-8 items-start">

          {/* Sol: kategori / home view */}
          <div className="flex-1 min-w-0">
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

              <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                <ProductGrid products={filteredProducts} t={t} searchTerm={debouncedSearch} fetchError={fetchError} onRetry={refreshProducts} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Market seçiliyken: kategori sekmeleri */}
              {selectedMarket !== 'all' && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => startTransition(() => setSelectedCategory('all'))}
                    className={`market-pill flex-none ${selectedCategory === 'all' ? 'market-pill-active' : ''}`}>
                    {lang === 'tr' ? 'Tümü' : lang === 'en' ? 'All' : 'Alles'}
                  </motion.button>
                  {CATEGORIES.filter(cat => products.some(p => p.market === selectedMarket && p.category === cat.id)).map(cat => (
                    <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
                      onClick={() => startTransition(() => setSelectedCategory(cat.id))}
                      className={`market-pill flex-none ${selectedCategory === cat.id ? 'market-pill-active' : ''}`}>
                      {CATEGORY_LABELS[cat.id]?.[lang] ?? cat.label}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* AD */}
              <AdBanner slot="6569328687" format="auto" className="mb-10" minHeight={280} />

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
                    onClick={() => startTransition(() => setShowCampaignsOnly(!showCampaignsOnly))}
                    className="p-2 rounded-full transition-all cursor-pointer"
                    style={{ background: showCampaignsOnly ? '#E33D26' : 'rgba(0,0,0,0.04)', color: showCampaignsOnly ? 'white' : '#6B6259' }}>
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </motion.button>
                </div>
                <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                  <ProductGrid products={filteredProducts} t={t} searchTerm={debouncedSearch} fetchError={fetchError} onRetry={refreshProducts} />
                </div>
              </section>

              <NewsletterSignup />

            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
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
          <span className="font-headline text-[10px] font-bold uppercase">
            {lang === 'tr' ? 'Fırsatlar' : lang === 'en' ? 'Deals' : 'Aanbied.'}
          </span>
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer relative"
          style={{ color: '#6B6259' }}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-headline text-[10px] font-bold uppercase">
            {lang === 'tr' ? 'Sepetim' : lang === 'en' ? 'Cart' : 'Mandje'}
          </span>
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
          <span className="font-headline text-[10px] font-bold uppercase">
            {lang === 'tr' ? 'Tara' : lang === 'en' ? 'Scan' : 'Scannen'}
          </span>
        </button>
        <button
          onClick={() => setShowCampaignsOnly(!showCampaignsOnly)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
          style={{ color: showCampaignsOnly ? '#E33D26' : '#6B6259' }}
        >
          <span className="material-symbols-outlined">local_fire_department</span>
          <span className="font-headline text-[10px] font-bold uppercase">
            {lang === 'tr' ? 'Kampanya' : lang === 'en' ? 'Deals' : 'Actie'}
          </span>
        </button>
      </nav>

      <ShoppingListSidebar />
      <AddProductForm onAdded={refreshProducts} />

      <footer style={{ textAlign: 'center', padding: '32px 24px', marginTop: 40, borderTop: '1px solid #F0E6DE', fontSize: 13, color: '#888' }}>
        <div style={{ marginBottom: 12 }}>
          <a href="/privacy" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Privacybeleid</a>
          <a href="/contact" style={{ color: '#E33D26', textDecoration: 'none' }}>Contact</a>
        </div>
        <div>© 2026 DealHunter4U — Alle supermarkt aanbiedingen op één plek</div>
        <div style={{ marginTop: 8 }}>
          <a href="/blog" style={{ color: '#8C8478', textDecoration: 'none', marginRight: 16 }}>Blog</a>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON — mobilde her zaman görünür */}
      <a
        href="https://chat.whatsapp.com/C4Q20ugQTIYKdY4ZCeNqL2"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
        style={{ background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13 }}
        aria-label="WhatsApp groep — dagelijkse topdeals"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Dagelijkse topdeals
      </a>
    </div>
  )
}

const AD_INTERVAL = 12

function ProductGrid({ products, t, searchTerm = '', fetchError = false, onRetry }: { products: Product[]; t: { noProducts: string; noProductsDesc: string }; searchTerm?: string; fetchError?: boolean; onRetry?: () => void }) {
  if (fetchError) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 rounded-3xl px-6 border-2 border-dashed border-red-200" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#E33D26' }}>signal_disconnected</span>
        <p className="text-xl font-headline font-bold mb-2" style={{ color: '#1A1A1A' }}>Bağlantı Hatası</p>
        <p className="max-w-md mx-auto text-sm mb-6" style={{ color: '#8C8478' }}>
          Ürünler yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          style={{ background: '#1A1A1A', color: 'white' }}
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Tekrar Dene
        </button>
      </motion.div>
    )
  }

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
          <AdBanner slot="6629568666" format="auto" className="my-2" minHeight={280} />
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
