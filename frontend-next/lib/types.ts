export interface Product {
  id: string
  name: string
  market: string
  originalPrice: number
  discountedPrice: number
  discount: number
  imageUrl: string | null
  isCampaign: boolean
  source: string
  expiresAt: string
  createdAt: string
  category: string
  brand?: string | null
  unitSize?: number | null
  unitType?: string | null
  unitPrice?: number | null
  fullSizeLabel?: string | null
  campaignType?: string | null
  affiliateUrl?: string | null
}

export const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  'groente-fruit': { nl: 'Groente & Fruit', en: 'Fruit & Vegetables', tr: 'Meyve & Sebze' },
  'zuivel':        { nl: 'Zuivel', en: 'Dairy', tr: 'Süt Ürünleri' },
  'vlees-vis':     { nl: 'Vlees & Vis', en: 'Meat & Fish', tr: 'Et & Balık' },
  'dranken':       { nl: 'Dranken', en: 'Beverages', tr: 'İçecekler' },
  'bakkerij':      { nl: 'Bakkerij', en: 'Bakery', tr: 'Fırın' },
  'snacks':        { nl: 'Snacks', en: 'Snacks', tr: 'Atıştırmalık' },
  'maaltijden':    { nl: 'Maaltijden', en: 'Meals', tr: 'Yemekler' },
  'verzorging':    { nl: 'Verzorging', en: 'Personal Care', tr: 'Kişisel Bakım' },
  'huishouden':    { nl: 'Huishouden', en: 'Household', tr: 'Ev Ürünleri' },
  'overig':        { nl: 'Overig', en: 'Other', tr: 'Diğer' },
}

export const CATEGORIES = [
  { id: 'groente-fruit', label: 'Groente & Fruit', emoji: '🥦' },
  { id: 'zuivel', label: 'Zuivel', emoji: '🥛' },
  { id: 'vlees-vis', label: 'Vlees & Vis', emoji: '🥩' },
  { id: 'dranken', label: 'Dranken', emoji: '🍺' },
  { id: 'bakkerij', label: 'Bakkerij', emoji: '🥖' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪' },
  { id: 'maaltijden', label: 'Maaltijden', emoji: '🍳' },
  { id: 'verzorging', label: 'Verzorging', emoji: '🧴' },
  { id: 'huishouden', label: 'Huishouden', emoji: '🧹' },
  { id: 'overig', label: 'Overig', emoji: '📦' },
]

export const MARKETS = [
  {
    slug: 'albert-heijn',
    name: 'Albert Heijn',
    color: '#00A0E2',
    ctaTitle: 'AH Bonus Aanbiedingen | Albert Heijn Deals & 1+1 Gratis Acties Deze Week',
    description: 'Alle AH aanbiedingen en bonus deals deze week op één plek — 1+1 gratis, 2e halve prijs en tot 50% korting. Aanbieding Albert Heijn dagelijks bijgewerkt, geen app nodig. Direct vergelijken met Jumbo en Lidl.',
    keywords: 'ah aanbiedingen, bonus aanbiedingen, bonus aanbiedingen deze week, aanbiedingen ah, ah aanbieding, albert heijn bonus aanbiedingen, albert heijn aanbieding, albert heijn aanbiedingen, albert heijn bonus, AH acties, ah bonus deze week, 1+1 gratis ah, a h aanbiedingen',
  },
  {
    slug: 'jumbo',
    name: 'Jumbo',
    color: '#FFD700',
    ctaTitle: 'Jumbo Aanbiedingen & Weekdeals | Aanbiedingen Jumbo Folder Deze Week',
    description: 'Alle Jumbo aanbiedingen en weekdeals deze week op één plek — 1+1 gratis, 2e halve prijs en actuele jumbo aanbieding. Aanbiedingen Jumbo dagelijks bijgewerkt, gemiddeld 2-5% goedkoper dan AH.',
    keywords: 'jumbo aanbiedingen, aanbiedingen jumbo, jumbo aanbieding, jumbo folder, jumbo deals, jumbo week aanbieding, jumbo aanbieding deze week, jumbo 1+1, jumbo korting, jumbo weekaanbieding',
  },
  {
    slug: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    ctaTitle: 'Lidl Deals & Aanbiedingen Deze Week | 15-25% Goedkoper dan AH',
    description: 'Alle Lidl deals en aanbiedingen van deze week — weekdeals, verse producten, non-food en dagelijkse verrassingen. Lidl deal van de dag? Hier altijd actueel. Gemiddeld 15-25% goedkoper dan AH.',
    keywords: 'lidl deals, lidl aanbiedingen, deals lidl, lidl deal van de dag, lidl actie, lidl folder, lidl nederland aanbieding, lidl aanbieding deze week, lidl korting',
  },
  {
    slug: 'dirk',
    name: 'Dirk',
    color: '#C8102E',
    ctaTitle: 'Dirk Aanbiedingen Deze Week | Laagste Vleesprijzen van NL',
    description: 'Alle Dirk van den Broek aanbiedingen van deze week — vergelijk direct met AH en Jumbo. Laagste vleesprijzen van Nederland, scherpe dranken- en groentedeals. Dagelijks bijgewerkt.',
    keywords: 'aanbiedingen dirk van den broek, dirk van den broek aanbiedingen, aanbieding dirk van den broek, dirkvandenbroek folder, dirk van de broek aanbiedingen, aanbiedingen dirk van de broek, aanbiedingen dirk, dirk aanbiedingen, dirk folder, dirk deals, dirk aanbieding, dirk aanbieding deze week',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    ctaTitle: 'Aldi Aanbiedingen & Acties Deze Week | Tot 30% Goedkoper',
    description: 'Alle Aldi aanbiedingen & acties van deze week — elke maandag nieuw. Vlees, groente en zuivel tot 30% goedkoper dan AH en Jumbo. Dagelijks bijgewerkt, geen folder nodig.',
    keywords: 'aldi deals, aanbiedingen aldi, aldi aanbiedingen, aldi actie, aldi acties, aldi aanbiedingen deze week, aldi korting, aldi folder, aldi nederland, aldi aanbieding deze week',
  },
  {
    slug: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#164194',
    ctaTitle: 'Hoogvliet Acties & Weekdeals | Aanbiedingen Deze Week Bijgewerkt',
    description: 'Bekijk alle Hoogvliet acties van deze week en vergelijk direct met AH, Jumbo en Lidl. Weekdeals op vlees, zuivel en verse producten — dagelijks bijgewerkt. Bespaar tot 40%.',
    keywords: 'hoogvliet acties, hoogvliet aanbiedingen, hoogvliet aanbieding deze week, hoogvliet folder, hoogvliet deals, hoogvliet korting, hoogvliet actie, hoogvliet supermarkt aanbieding',
  },
  {
    slug: 'vomar',
    name: 'Vomar',
    color: '#FF6600',
    ctaTitle: 'Vomar Aanbiedingen Deze Week | Actuele Deals & Folder',
    description: 'Alle Vomar aanbiedingen van deze week — weekacties, verse producten en huishouddeals. Direct van de website, dagelijks bijgewerkt.',
    keywords: 'vomar aanbiedingen, vomar folder, vomar deals, vomar supermarkt, vomar aanbieding deze week, vomar korting, vomar actie, vomar weekaanbieding',
    // Vomar publiceert weekaanbiedingen alleen als afbeelding (Publitas-folder),
    // geen gestructureerde prijsdata beschikbaar → verborgen tot er een bron is.
    hidden: true,
  },
  {
    slug: 'dekamarkt',
    name: 'DekaMarkt',
    color: '#006633',
    ctaTitle: 'DekaMarkt Aanbiedingen Deze Week | Combi-Deals & Kortingen tot 40%',
    description: 'Bekijk alle DekaMarkt aanbiedingen van deze week en vergelijk direct met AH en Jumbo. Combi-deals, 1+1 gratis en weekdeals — dagelijks bijgewerkt. Bespaar tot 40%.',
    keywords: 'aanbiedingen dekamarkt, aanbieding dekamarkt, dekamarkt aanbiedingen, dekamarkt aanbieding, dekamarkt aanbiedingen deze week, dekamarkt folder, dekamarkt deals, dekamarkt actie, dekamarkt aanbieding deze week, dekamarkt korting, dekamarkt weekaanbieding',
  },
  {
    slug: 'coop',
    name: 'Coop',
    color: '#007B5E',
    ctaTitle: 'Coop Aanbiedingen Deze Week | Actuele Deals & Kortingen',
    description: 'Alle Coop supermarkt aanbiedingen van deze week — weekdeals, verse producten en huishouddeals. Dagelijks bijgewerkt zonder app.',
    keywords: 'coop aanbiedingen, coop folder, coop supermarkt deals, coop actie, coop aanbieding deze week, coop korting, coop weekaanbieding',
    // Coop gebruikt OutSystems SPA — geen server-side data beschikbaar zonder headless browser.
    hidden: true,
  },
]

// Markets shown in navigation, filters, footer and sitemap.
// Hidden markets (e.g. no structured data source) stay in MARKETS so existing
// products/colors keep resolving, but are excluded from public listings.
export const VISIBLE_MARKETS = MARKETS.filter(m => !(m as { hidden?: boolean }).hidden)

export const MARKET_COLORS: Record<string, string> = Object.fromEntries(
  MARKETS.map(m => [m.name, m.color])
)

export function getMarketInitial(name: string): string {
  if (name === 'Albert Heijn') return 'AH'
  return name.substring(0, 2).toUpperCase()
}
