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
    ctaTitle: 'Albert Heijn Bonus Aanbiedingen | 1+1 Gratis & Weekdeals',
    description: 'Alle AH Bonus deals van deze week — 1+1 gratis, 2e halve prijs en tot 50% korting. Dagelijks bijgewerkt. Geen app nodig.',
    keywords: 'ah aanbiedingen, albert heijn aanbieding, albert heijn bonus, albert heijn aanbiedingen, AH acties, AH bonus week, albert heijn folder, ah bonus deze week, 1+1 gratis ah',
  },
  {
    slug: 'jumbo',
    name: 'Jumbo',
    color: '#FFD700',
    ctaTitle: 'Jumbo Aanbiedingen Deze Week | Weekdeals & Kortingen',
    description: 'Alle Jumbo weekaanbiedingen op één plek — zonder folder bladeren. Vergelijk direct met Albert Heijn en bespaar op je boodschappen.',
    keywords: 'jumbo aanbiedingen, jumbo folder, jumbo deals, jumbo week aanbieding, jumbo aanbieding deze week, jumbo 1+1, jumbo korting',
  },
  {
    slug: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    ctaTitle: 'Lidl Aanbiedingen Deze Week | Weekdeals & Kortingen',
    description: 'Alle Lidl aanbiedingen van deze week: weekdeals, verse producten en non-food. Goedkoper dan AH of Jumbo? Vergelijk het direct.',
    keywords: 'lidl folder, lidl aanbiedingen, lidl deals, lidl nederland aanbieding, lidl aanbieding deze week, lidl korting, lidl actie',
  },
  {
    slug: 'dirk',
    name: 'Dirk',
    color: '#C8102E',
    ctaTitle: 'Dirk van den Broek Aanbiedingen | Actuele Acties & Folder',
    description: 'Alle Dirk aanbiedingen van deze week — vlees, dranken en huishoudproducten. Dagelijks bijgewerkt. Altijd de nieuwste Dirk folder online.',
    keywords: 'dirk aanbiedingen, dirk acties, dirk van den broek folder, reclamefolder dirk van de broek, dirk van de broek deals, dirk folder, dirk aanbieding deze week',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    ctaTitle: 'Aldi Aanbiedingen & Acties Deze Week | Weekdeals & Kortingen',
    description: 'Bekijk alle Aldi acties van deze week — weekdeals, seizoensaanbiedingen en opruimingen. Altijd de nieuwste Aldi aanbiedingen, zonder app.',
    keywords: 'aldi acties, aldi aanbiedingen, aldi actie, aldi korting, aldi deals, aldi folder, aldi nederland, aldi aanbieding deze week',
  },
  {
    slug: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#E30613',
    ctaTitle: 'Hoogvliet Aanbiedingen Deze Week | Acties & Kortingen',
    description: 'Alle Hoogvliet aanbiedingen en acties van deze week op één plek. Dagelijks bijgewerkt. Bespaar op verse producten en weekdeals.',
    keywords: 'hoogvliet aanbiedingen, hoogvliet folder, hoogvliet deals, hoogvliet aanbieding deze week, hoogvliet korting, hoogvliet actie, hoogvliet supermarkt aanbieding',
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
    ctaTitle: 'DekaMarkt Aanbiedingen Deze Week | Combi-deals & Kortingen',
    description: 'Alle DekaMarkt aanbiedingen en combi-aanbiedingen van deze week. Dagelijks bijgewerkt. Bespaar direct op verse producten en weekdeals.',
    keywords: 'dekamarkt aanbiedingen, dekamarkt folder, dekamarkt deals, dekamarkt actie, dekamarkt aanbieding deze week, dekamarkt korting, dekamarkt weekaanbieding, dekamarkt supermarkt',
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
