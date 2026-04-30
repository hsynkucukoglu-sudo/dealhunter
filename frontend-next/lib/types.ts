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
    description: 'Bekijk alle actuele Albert Heijn Bonus aanbiedingen. Vergelijk prijzen en bespaar op je boodschappen bij de grootste supermarkt van Nederland.',
    keywords: 'albert heijn bonus, albert heijn aanbiedingen, AH bonus week, albert heijn folder',
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
    description: 'Alle Dirk aanbiedingen en de actuele Dirk folder. Bespaar op boodschappen bij Dirk van den Broek.',
    keywords: 'dirk aanbiedingen, dirk folder, dirk van den broek deals',
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    color: '#00205B',
    description: 'Bekijk alle Aldi aanbiedingen van deze week. Goedkope boodschappen en aanbiedingen bij Aldi Nederland.',
    keywords: 'aldi aanbiedingen, aldi folder, aldi deals, aldi nederland',
  },
  {
    slug: 'plus',
    name: 'Plus',
    color: '#00A651',
    description: 'Alle Plus supermarkt aanbiedingen van deze week. Bekijk de Plus folder en bespaar op je boodschappen.',
    keywords: 'plus supermarkt aanbiedingen, plus folder, plus deals',
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
