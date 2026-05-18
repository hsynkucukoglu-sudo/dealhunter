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
    description: 'Bekijk alle actuele AH aanbiedingen en Albert Heijn Bonus deals ✓ Dagelijks bijgewerkt ✓ Vergelijk prijzen en bespaar op je boodschappen bij de grootste supermarkt van Nederland.',
    keywords: 'ah aanbiedingen, albert heijn aanbieding, albert heijn bonus, albert heijn aanbiedingen, AH acties, AH bonus week, albert heijn folder',
  },
  {
    slug: 'jumbo',
    name: 'Jumbo',
    color: '#FFD700',
    description: 'Alle Jumbo aanbiedingen van deze week. Bekijk de Jumbo folder online en ontdek de beste deals op boodschappen.',
    keywords: 'jumbo aanbiedingen, jumbo folder, jumbo deals, jumbo week aanbieding',
  },
  {
    slug: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    description: 'Bekijk de Lidl folder en alle actuele Lidl aanbiedingen. Goedkope boodschappen bij Lidl Nederland.',
    keywords: 'lidl folder, lidl aanbiedingen, lidl deals, lidl nederland aanbieding',
  },
  {
    slug: 'dirk',
    name: 'Dirk',
    color: '#C8102E',
    description: 'Alle Dirk acties en aanbiedingen van Dirk van den Broek ✓ Bekijk de actuele folder ✓ Dagelijks bijgewerkt. Bespaar op je boodschappen bij Dirk.',
    keywords: 'dirk aanbiedingen, dirk acties, dirk van den broek folder, reclamefolder dirk van de broek, dirk van de broek deals, dirk folder',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    description: 'Bekijk alle Aldi acties en aanbiedingen van deze week ✓ Dagelijks bijgewerkt ✓ Vergelijk Aldi kortingen en bespaar direct op je boodschappen.',
    keywords: 'aldi acties, aldi aanbiedingen, aldi actie, aldi korting, aldi deals, aldi folder, aldi nederland',
  },
  {
    slug: 'plus',
    name: 'Plus',
    color: '#00A651',
    description: 'Bekijk alle Plus supermarkt acties en aanbiedingen van deze week ✓ Dagelijks bijgewerkt ✓ Vergelijk Plus kortingen en bespaar op je boodschappen.',
    keywords: 'plus aanbiedingen, plus supermarkt, plus supermarkt aanbiedingen, plus acties, plus aanbieding, plus folder, plus deals, plus supermarkt folder',
  },
  {
    slug: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#E30613',
    description: 'Bekijk alle Hoogvliet aanbiedingen van deze week. Actuele folder en beste deals bij Hoogvliet supermarkt.',
    keywords: 'hoogvliet aanbiedingen, hoogvliet folder, hoogvliet deals',
  },
  {
    slug: 'vomar',
    name: 'Vomar',
    color: '#FF6600',
    description: 'Bekijk alle Vomar aanbiedingen van deze week. Goedkope boodschappen en actuele deals bij Vomar supermarkt.',
    keywords: 'vomar aanbiedingen, vomar folder, vomar deals, vomar supermarkt',
  },
]

export const MARKET_COLORS: Record<string, string> = Object.fromEntries(
  MARKETS.map(m => [m.name, m.color])
)

export function getMarketInitial(name: string): string {
  if (name === 'Albert Heijn') return 'AH'
  return name.substring(0, 2).toUpperCase()
}
