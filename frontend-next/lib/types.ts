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
    ctaTitle: '🔥 AH Bonus Deze Week | Albert Heijn Aanbiedingen & 1+1 Gratis Deals',
    description: '✅ Bekijk alle AH Bonus aanbiedingen van deze week – 1+1 gratis, halve prijs en tot 50% korting. Dagelijks bijgewerkt. Bespaar direct op je boodschappen bij Albert Heijn!',
    keywords: 'ah aanbiedingen, albert heijn aanbieding, albert heijn bonus, albert heijn aanbiedingen, AH acties, AH bonus week, albert heijn folder, ah bonus deze week, 1+1 gratis ah',
  },
  {
    slug: 'jumbo',
    name: 'Jumbo',
    color: '#FFD700',
    ctaTitle: '🛒 Jumbo Aanbiedingen Deze Week | Beste Jumbo Deals & Folder',
    description: '✅ Alle Jumbo aanbiedingen van deze week op één plek – actuele folder, 1+1 gratis en weekdeals. Dagelijks bijgewerkt. Bespaar nu op je boodschappen bij Jumbo!',
    keywords: 'jumbo aanbiedingen, jumbo folder, jumbo deals, jumbo week aanbieding, jumbo aanbieding deze week, jumbo 1+1, jumbo korting',
  },
  {
    slug: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    ctaTitle: '💛 Lidl Aanbiedingen Deze Week | Folder & Beste Lidl Deals',
    description: '✅ Ontdek alle Lidl aanbiedingen van deze week – goedkope boodschappen, weekdeals en folder online. Dagelijks bijgewerkt. Bespaar direct bij Lidl Nederland!',
    keywords: 'lidl folder, lidl aanbiedingen, lidl deals, lidl nederland aanbieding, lidl aanbieding deze week, lidl korting, lidl actie',
  },
  {
    slug: 'dirk',
    name: 'Dirk',
    color: '#C8102E',
    ctaTitle: '🔴 Dirk Aanbiedingen Deze Week | Dirk van den Broek Folder & Acties',
    description: '✅ Alle actuele Dirk acties en aanbiedingen van Dirk van den Broek – dagelijks bijgewerkt, beste deals eenvoudig gevonden. Bespaar nu op je boodschappen bij Dirk!',
    keywords: 'dirk aanbiedingen, dirk acties, dirk van den broek folder, reclamefolder dirk van de broek, dirk van de broek deals, dirk folder, dirk aanbieding deze week',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    ctaTitle: '🏷️ Aldi Aanbiedingen Deze Week | Aldi Acties & Kortingen',
    description: '✅ Bekijk alle Aldi aanbiedingen en kortingen van deze week – actuele acties, weekdeals en folder online. Dagelijks bijgewerkt. Bespaar direct op je boodschappen bij Aldi!',
    keywords: 'aldi acties, aldi aanbiedingen, aldi actie, aldi korting, aldi deals, aldi folder, aldi nederland, aldi aanbieding deze week',
  },
  {
    slug: 'hoogvliet',
    name: 'Hoogvliet',
    color: '#E30613',
    ctaTitle: '🔴 Hoogvliet Aanbiedingen Deze Week | Folder, Acties & Kortingen',
    description: '✅ Alle Hoogvliet aanbiedingen van deze week op één plek – actuele folder, weekdeals en supermarktacties. Dagelijks bijgewerkt. Bespaar slim bij Hoogvliet supermarkt!',
    keywords: 'hoogvliet aanbiedingen, hoogvliet folder, hoogvliet deals, hoogvliet aanbieding deze week, hoogvliet korting, hoogvliet actie, hoogvliet supermarkt aanbieding',
  },
  {
    slug: 'vomar',
    name: 'Vomar',
    color: '#FF6600',
    ctaTitle: '🟠 Vomar Aanbiedingen Deze Week | Actuele Folder & Weekdeals',
    description: '✅ Alle Vomar aanbiedingen van deze week op één plek – folder, weekacties en kortingen. Dagelijks bijgewerkt. Bespaar slim op je boodschappen bij Vomar supermarkt!',
    keywords: 'vomar aanbiedingen, vomar folder, vomar deals, vomar supermarkt, vomar aanbieding deze week, vomar korting, vomar actie, vomar weekaanbieding',
  },
  {
    slug: 'dekamarkt',
    name: 'DekaMarkt',
    color: '#006633',
    ctaTitle: '🟢 DekaMarkt Aanbiedingen Deze Week | Actuele Folder & Kortingen',
    description: '✅ Alle DekaMarkt aanbiedingen van deze week op één plek – weekdeals, combi-aanbiedingen en actuele folder. Dagelijks bijgewerkt. Bespaar direct op je boodschappen bij DekaMarkt!',
    keywords: 'dekamarkt aanbiedingen, dekamarkt folder, dekamarkt deals, dekamarkt actie, dekamarkt aanbieding deze week, dekamarkt korting, dekamarkt weekaanbieding, dekamarkt supermarkt',
  },
]

export const MARKET_COLORS: Record<string, string> = Object.fromEntries(
  MARKETS.map(m => [m.name, m.color])
)

export function getMarketInitial(name: string): string {
  if (name === 'Albert Heijn') return 'AH'
  return name.substring(0, 2).toUpperCase()
}
