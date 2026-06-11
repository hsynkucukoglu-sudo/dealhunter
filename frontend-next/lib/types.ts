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
    ctaTitle: 'AH Bonus Aanbiedingen Deze Week: 1+1 Gratis & Halve Prijs (Actueel)',
    description: 'Alle AH bonus aanbiedingen van deze week — 1+1 gratis, 2e halve prijs en tot 50% korting op 50-80 producten. Dagelijks bijgewerkt, geen app nodig. Direct vergelijken met Jumbo en Lidl.',
    keywords: 'bonus aanbiedingen, ah aanbiedingen, albert heijn bonus aanbiedingen, bonus aanbiedingen deze week, albert heijn aanbieding, albert heijn bonus, albert heijn aanbiedingen, AH acties, AH bonus week, albert heijn folder, ah bonus deze week, 1+1 gratis ah',
  },
  {
    slug: 'jumbo',
    name: 'Jumbo',
    color: '#FFD700',
    ctaTitle: 'Jumbo Folder Deze Week: Goedkoper dan AH? Vergelijk & Bespaar',
    description: 'Alle Jumbo weekaanbiedingen op één plek — 1+1 gratis, 2e halve prijs en weekdeals. Jumbo is gemiddeld 2-5% goedkoper dan AH. Vergelijk direct en bespaar.',
    keywords: 'jumbo aanbiedingen, jumbo folder, jumbo deals, jumbo week aanbieding, jumbo aanbieding deze week, jumbo 1+1, jumbo korting',
  },
  {
    slug: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    ctaTitle: 'Lidl Aanbiedingen & Deals Deze Week | 15-25% Goedkoper dan AH (Actueel)',
    description: 'Alle Lidl aanbiedingen en deals van deze week — weekdeals, verse producten, non-food en dagelijkse verrassingen. Lidl deal van de dag? Hier altijd actueel. Gemiddeld 15-25% goedkoper dan AH.',
    keywords: 'lidl aanbiedingen, lidl deals, lidl deal van de dag, deals lidl, lidl actie, lidl folder, lidl nederland aanbieding, lidl aanbieding deze week, lidl korting',
  },
  {
    slug: 'dirk',
    name: 'Dirk',
    color: '#C8102E',
    ctaTitle: 'Dirk Aanbiedingen Deze Week | Dirk van den Broek — Laagste Vleesprijzen',
    description: 'Alle Dirk van den Broek aanbiedingen van deze week — structureel de laagste vleesprijzen van Nederland, plus scherpe dranken- en groentedeals. Dagelijks bijgewerkt, direct te vergelijken.',
    keywords: 'dirk aanbiedingen, aanbiedingen dirk van den broek, aanbieding dirk van den broek, dirk van den broek aanbiedingen, dirk acties, dirk van den broek folder, dirk folder, dirk aanbieding deze week, dirk deals',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    ctaTitle: 'Aldi Aanbiedingen & Acties Deze Week | 20-30% Goedkoper dan AH en Jumbo',
    description: 'Alle Aldi aanbiedingen en acties van deze week — huismerkdeals, non-food acties en seizoensaanbiedingen. Aldi is gemiddeld 20-30% goedkoper dan AH en Jumbo. Dagelijks bijgewerkt.',
    keywords: 'aldi acties, aldi aanbiedingen, aldi actie, aldi aanbiedingen deze week, aldi korting, aldi deals, aldi folder, aldi nederland, aldi aanbieding deze week',
  },
  {
    slug: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#E30613',
    ctaTitle: 'Hoogvliet Aanbiedingen & Acties Deze Week | Kortingen tot 40%',
    description: 'Alle Hoogvliet aanbiedingen en acties van deze week — verse producten, vlees en weekdeals met kortingen tot 40%. Dagelijks bijgewerkt voor Randstad-bewoners. Direct vergelijken zonder folder.',
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
    ctaTitle: 'DekaMarkt Aanbiedingen Deze Week | Combi-deals & Kortingen',
    description: 'Alle DekaMarkt aanbiedingen van deze week — combi-deals, 1+1 gratis en verse producten tot 40% korting. Geen folder bladeren: dagelijks bijgewerkt op één overzicht.',
    keywords: 'dekamarkt aanbiedingen, dekamarkt aanbiedingen deze week, dekamarkt aanbieding, aanbiedingen dekamarkt, dekamarkt folder, dekamarkt deals, dekamarkt actie, dekamarkt aanbieding deze week, dekamarkt korting, dekamarkt weekaanbieding, dekamarkt supermarkt',
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
