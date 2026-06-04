declare function gtag(...args: unknown[]): void

function track(event: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof gtag !== 'undefined') gtag('event', event, params)
  } catch {}
}

// Ürün kartı — "Naar [Market]" tıklaması
export function trackDealClick(productName: string, market: string, discountPct: number) {
  track('select_promotion', {
    promotion_name: productName,
    creative_name: market,
    creative_slot: `deal_card_${Math.round(discountPct)}pct`,
  })
  track('deal_click', { market, product: productName, discount_pct: discountPct })
}

// Market filtresi seçimi
export function trackMarketFilter(market: string) {
  track('filter_market', { market })
}

// Kategori filtresi seçimi
export function trackCategoryFilter(category: string) {
  track('filter_category', { category })
}

// Kampanya tipi filtresi (1+1, %, etc.)
export function trackCampaignFilter(campaignType: string) {
  track('filter_campaign', { campaign_type: campaignType })
}

// Arama
export function trackSearch(searchTerm: string, resultCount: number) {
  track('search', { search_term: searchTerm, result_count: resultCount })
}

// Favori ekleme
export function trackAddFavorite(productName: string, market: string) {
  track('add_to_wishlist', { item_name: productName, item_brand: market, wishlist_type: 'favorite' })
}

// Fiyat izleme (watchlist)
export function trackAddWatchlist(productName: string, market: string) {
  track('add_to_wishlist', { item_name: productName, item_brand: market, wishlist_type: 'price_watch' })
}

// Newsletter kaydı
export function trackNewsletterSignup() {
  track('generate_lead', { method: 'newsletter' })
}

// PWA install tıklaması
export function trackPwaInstall() {
  track('pwa_install_click')
}
