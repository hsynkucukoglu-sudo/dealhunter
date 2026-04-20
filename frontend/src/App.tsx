import '@/styles/index.css'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hero } from '@/components/Hero'
import { ProductCard } from '@/components/ProductCard'
import { AddProductForm } from '@/components/AddProductForm'
import { ShoppingListSidebar } from '@/components/ShoppingListSidebar'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Product, useShoppingList } from '@/context/ShoppingListContext'
import { useLanguage } from '@/context/LanguageContext'

// Market renkleri
const MARKET_COLORS: Record<string, string> = {
  'Albert Heijn': '#00A0E2',
  'Aldi': '#00205B',
  'Dirk': '#C8102E',
  'Jumbo': '#FFD700',
  'Lidl': '#0050AA',
  'Plus': '#00A651',
  'Hoogvliet': '#E30613',
}

function getMarketInitial(name: string): string {
  if (name === 'Albert Heijn') return 'AH'
  return name.substring(0, 2).toUpperCase()
}

export function App() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isScraping, setIsScraping] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCampaignsOnly, setShowCampaignsOnly] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [navScrolled, setNavScrolled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  const { itemCount, setIsCartOpen, totalSavings } = useShoppingList()

  useEffect(() => {
    fetchProducts()

    // Scraper arka planda çalışıyorsa ürünler gelene kadar polling yap
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch('/api/status')
        const { scraperRunning } = await statusRes.json()
        if (scraperRunning) {
          setIsScraping(true)
        } else {
          setIsScraping(false)
          const res = await fetch('/api/products')
          const data = await res.json()
          if (data && data.length > 0) {
            setProducts(data)
            clearInterval(pollInterval)
          }
        }
      } catch {}
    }, 5000)

    // 3 dakika sonra polling'i durdur
    const stopTimeout = setTimeout(() => clearInterval(pollInterval), 180000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(stopTimeout)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchFlyers = async () => {
    setIsScraping(true)
    try {
      const response = await fetch('/api/scraper/run', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        alert(`${result.count} yeni kampanya ürünü başarıyla bültenlerden çekildi!`)
        await fetchProducts()
      }
    } catch (error) {
      console.error('Bültenler çekilirken hata:', error)
      alert('Bültenleri çekerken bir sorun oluştu.')
    } finally {
      setIsScraping(false)
    }
  }

  const handleAddProduct = async (newProduct: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })
      if (response.ok) {
        await fetchProducts()
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error || 'Ürün eklenemedi'}`)
      }
    } catch (error) {
      console.error('Ürün eklenirken hata:', error)
      alert('Ürün eklenirken bir sorun oluştu.')
    }
  }

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.market.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCampaign = showCampaignsOnly ? p.isCampaign : true
    const matchesMarket = selectedMarket === 'all' ? true : p.market === selectedMarket
    const matchesCategory = selectedCategory === 'all' ? true : (p as any).category === selectedCategory
    return matchesSearch && matchesCampaign && matchesMarket && matchesCategory
  }), [products, searchTerm, showCampaignsOnly, selectedMarket, selectedCategory])

  const CATEGORIES = [
    { id: 'all', label: '⚡ Alles' },
    { id: 'groente-fruit', label: '🥦 Groente & Fruit' },
    { id: 'zuivel', label: '🥛 Zuivel' },
    { id: 'vlees-vis', label: '🥩 Vlees & Vis' },
    { id: 'dranken', label: '🍺 Dranken' },
    { id: 'bakkerij', label: '🥖 Bakkerij' },
    { id: 'snacks', label: '🍪 Snacks' },
    { id: 'maaltijden', label: '🍳 Maaltijden' },
    { id: 'verzorging', label: '🧴 Verzorging' },
    { id: 'huishouden', label: '🧹 Huishouden' },
    { id: 'overig', label: '📦 Overig' },
  ]

  const availableMarkets = useMemo(() =>
    Array.from(new Set(products.map(p => p.market))).sort()
  , [products])

  const potentialSavings = useMemo(() =>
    filteredProducts.reduce((sum, p) => {
      const saving = p.originalPrice > p.discountedPrice ? p.originalPrice - p.discountedPrice : 0
      return sum + saving
    }, 0)
  , [filteredProducts])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>

      {/* ============================== */}
      {/* FLOATING PILL NAVBAR           */}
      {/* ============================== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`fixed top-4 left-4 right-4 z-50 flex justify-between items-center px-4 md:px-6 h-14 rounded-full transition-all duration-300 ${
          navScrolled ? 'navbar-pill' : 'bg-transparent'
        }`}
        style={navScrolled ? {} : { border: 'none', boxShadow: 'none' }}
      >
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-6">
          <span className="text-xl font-black tracking-tighter font-headline" style={{ color: '#E33D26' }}>
            DEALHUNTER
          </span>
          <div className="hidden md:flex gap-1 items-center">
            <a
              onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(false) }}
              className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-black/5"
              style={{ color: '#1A1A1A' }}
            >
              {t.scanBtn}
            </a>
            <a
              onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(true) }}
              className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-black/5"
              style={{ color: '#6B6259' }}
            >
              {t.campaignsOnly}
            </a>
          </div>
        </div>

        {/* Right: Search + Cart + Scrape */}
        <div className="flex items-center gap-2">
          {/* Mini search on scroll */}
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
                    type="text"
                    placeholder="Ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full"
                    style={{ color: '#1A1A1A' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PWA Install Button */}
          <AnimatePresence>
            {canInstall && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleInstallPWA}
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all"
                style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
              >
                <span className="material-symbols-outlined text-base">install_mobile</span>
                Yükle
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrape Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleFetchFlyers}
            disabled={isScraping}
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
            style={{ background: '#1A1A1A', color: 'white', fontFamily: 'Space Grotesk' }}
          >
            {isScraping ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-base">refresh</span>
            )}
            {isScraping ? t.scanning : t.scanBtn}
          </motion.button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Cart */}
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

      {/* ============================== */}
      {/* MAIN CONTENT                   */}
      {/* ============================== */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-32">

        {/* Hero Section */}
        <Hero
          onScrape={handleFetchFlyers}
          isScraping={isScraping}
          totalSavings={potentialSavings}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          productCount={filteredProducts.length}
        />

        {/* Category Tabs */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: selectedCategory === cat.id ? '#1A1A1A' : 'rgba(255,255,255,0.7)',
                  color: selectedCategory === cat.id ? 'white' : '#6B6259',
                  border: selectedCategory === cat.id ? 'none' : '1px solid rgba(201,193,182,0.5)',
                }}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Market Pills Carousel */}
        {availableMarkets.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {/* All */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(false) }}
                className={`market-pill ${selectedMarket === 'all' && !showCampaignsOnly ? 'market-pill-active' : ''}`}
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                {t.allMarkets}
              </motion.button>

              {/* Campaign */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedMarket('all'); setShowCampaignsOnly(true) }}
                className={`market-pill ${showCampaignsOnly ? 'market-pill-active' : ''}`}
              >
                <span className="material-symbols-outlined text-base">local_fire_department</span>
                {t.campaignsOnly}
              </motion.button>

              {/* Separator */}
              <div className="w-px h-6 flex-none" style={{ background: '#C9C1B6' }} />

              {/* Markets */}
              {availableMarkets.map(market => (
                <motion.button
                  key={market}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedMarket(market); setShowCampaignsOnly(false) }}
                  className={`market-pill ${selectedMarket === market && !showCampaignsOnly ? 'market-pill-active' : ''}`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                    style={{ background: MARKET_COLORS[market] || '#6B6259' }}
                  >
                    {getMarketInitial(market)}
                  </div>
                  {market}
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Product Grid Section */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                {selectedMarket === 'all'
                  ? (showCampaignsOnly ? t.campaignsOnly : t.scanBtn)
                  : `${selectedMarket}`}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#8C8478' }}>{filteredProducts.length} {t.activeProducts}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCampaignsOnly(!showCampaignsOnly)}
                className="p-2 rounded-full transition-all cursor-pointer"
                style={{
                  background: showCampaignsOnly ? '#E33D26' : 'rgba(0,0,0,0.04)',
                  color: showCampaignsOnly ? 'white' : '#6B6259'
                }}
                title={t.campaignsOnly}
              >
                <span className="material-symbols-outlined">local_fire_department</span>
              </motion.button>
            </div>
          </div>

          {/* Grid */}
          {loading || (isScraping && products.length === 0) ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: '#E8DCCB', borderTopColor: '#E33D26' }} />
              <p className="text-sm font-medium" style={{ color: '#8C8478' }}>
                {isScraping ? t.scrapingMsg : t.loadingProducts}
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
              <p className="text-xl font-headline font-bold mb-2" style={{ color: '#1A1A1A' }}>{t.noProducts}</p>
              <p className="max-w-md mx-auto text-sm" style={{ color: '#8C8478' }}>
                {t.noProductsDesc}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>

      {/* ============================== */}
      {/* BOTTOM MOBILE NAV              */}
      {/* ============================== */}
      <nav
        className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 z-50 md:hidden"
        style={{
          background: 'rgba(245, 237, 227, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(201, 193, 182, 0.4)'
        }}
      >
        <a
          onClick={() => { setSelectedMarket('Tümü'); setShowCampaignsOnly(false) }}
          className="flex flex-col items-center justify-center p-2 cursor-pointer rounded-2xl"
          style={{ background: '#E33D26', color: 'white', marginTop: '-12px', boxShadow: '0 4px 16px rgba(227,61,38,0.3)' }}
        >
          <span className="material-symbols-outlined">bolt</span>
          <span className="font-headline text-[10px] font-bold uppercase">Fırsatlar</span>
        </a>
        <a
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer relative"
          style={{ color: '#6B6259' }}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-headline text-[10px] font-bold uppercase">Sepetim</span>
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 text-[9px] font-bold px-1 rounded-full"
              style={{ background: '#E33D26', color: 'white' }}>
              {itemCount}
            </span>
          )}
        </a>
        <a
          onClick={handleFetchFlyers}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
          style={{ color: '#6B6259' }}
        >
          <span className="material-symbols-outlined">refresh</span>
          <span className="font-headline text-[10px] font-bold uppercase">Tara</span>
        </a>
        <a
          onClick={() => setShowCampaignsOnly(!showCampaignsOnly)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer"
          style={{ color: showCampaignsOnly ? '#E33D26' : '#6B6259' }}
        >
          <span className="material-symbols-outlined">local_fire_department</span>
          <span className="font-headline text-[10px] font-bold uppercase">Kampanya</span>
        </a>
      </nav>

      {/* Overlays */}
      <ShoppingListSidebar />
      <AddProductForm onSubmit={handleAddProduct} />
    </div>
  )
}

export default App
