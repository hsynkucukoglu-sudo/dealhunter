import { trackClick } from './track'

declare function gtag(...args: unknown[]): void

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

function track(event: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof gtag !== 'undefined') gtag('event', event, params)
  } catch {}
  // Clarity krijgt hetzelfde event als custom event. Reden: zoeken en filteren
  // veranderen de URL niet, dus Clarity zag in-page interactie helemaal niet en
  // rapporteerde 30 dagen lang 1,01 pagina per sessie — zie docs/clarity-takip.md
  // 2026-08-18. Zonder deze regel is niet te onderscheiden of iemand echt na één
  // pagina vertrekt of gewoon binnen dezelfde URL doorzoekt.
  // window.clarity bestaat al als queue-stub (layout.tsx, beforeInteractive),
  // dus calls van vóór het laden van de tag gaan niet verloren.
  try {
    window.clarity?.('event', event)
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
  // First-party log — EPC hesabı için (bkz. backend /api/track/stats)
  trackClick('market', market, productName)
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

// Snelfilterrij bovenaan de pagina (Alle / Alleen Acties / Kassakoopjes / hot).
// Deze knoppen stonden als enige filters níet in de tracking, terwijl ze wel
// boven de vouw staan — zie docs/clarity-takip.md 2026-08-18.
export function trackQuickFilter(filter: string) {
  track('filter_quick', { filter })
}

// Arama
export function trackSearch(searchTerm: string, resultCount: number) {
  track('search', { search_term: searchTerm, result_count: resultCount })
  // Aparte Clarity-tag zodat sessies met een lege zoekopdracht te segmenteren
  // zijn. De zoekterm zelf gaat bewust NIET mee — alleen of er treffers waren.
  try {
    window.clarity?.('set', 'search_result', resultCount > 0 ? 'hit' : 'empty')
  } catch {}
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
