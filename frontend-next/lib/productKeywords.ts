import { getProducts } from './api'
import type { Product } from './types'

export interface ProductKeyword {
  slug: string
  label: string
  searchTerms: string[]
  category?: string
  description: string
}

export const PRODUCT_KEYWORDS: ProductKeyword[] = [
  { slug: 'rundergehakt',  label: 'Rundergehakt',  searchTerms: ['rundergehakt', 'gehakt'],   category: 'vlees-vis',    description: 'Verse rundergehakt aanbiedingen bij alle supermarkten deze week.' },
  { slug: 'kipfilet',      label: 'Kipfilet',      searchTerms: ['kipfilet', 'kip filet'],    category: 'vlees-vis',    description: 'Kipfilet aanbiedingen vergelijken bij AH, Jumbo, Lidl en meer.' },
  { slug: 'wasmiddel',     label: 'Wasmiddel',     searchTerms: ['wasmiddel', 'waspoeder', 'waspods'], category: 'huishouden', description: 'Goedkoop wasmiddel kopen? Vergelijk alle wasmiddel aanbiedingen.' },
  { slug: 'luiers',        label: 'Luiers',        searchTerms: ['luier'],                    category: 'overig',       description: 'Luiers in de aanbieding — vergelijk Pampers, Huggies en huismerk.' },
  { slug: 'koffie',        label: 'Koffie',        searchTerms: ['koffie'],                   category: 'dranken',      description: 'Koffie aanbiedingen bij alle supermarkten — bonen, cups en filterkoffie.' },
  { slug: 'bier',          label: 'Bier',          searchTerms: ['bier'],                     category: 'dranken',      description: 'Bier in de aanbieding — vergelijk Heineken, Grolsch, Amstel en meer.' },
  { slug: 'kaas',          label: 'Kaas',          searchTerms: ['kaas'],                     category: 'zuivel',       description: 'Kaas aanbiedingen vergelijken — Goudse, belegen, jong en oud.' },
  { slug: 'airfryer',      label: 'Airfryer',      searchTerms: ['airfryer'],                 category: 'overig',       description: 'Airfryer aanbiedingen — wanneer is de beste prijs?' },
  { slug: 'yoghurt',       label: 'Yoghurt',       searchTerms: ['yoghurt', 'yogurt'],        category: 'zuivel',       description: 'Yoghurt aanbiedingen vergelijken bij alle supermarkten.' },
  { slug: 'melk',          label: 'Melk',          searchTerms: ['melk'],                     category: 'zuivel',       description: 'Melk in de aanbieding — volle, halfvolle en magere melk deals.' },
  { slug: 'pasta',         label: 'Pasta',         searchTerms: ['pasta', 'spaghetti', 'penne'], category: 'maaltijden', description: 'Pasta aanbiedingen vergelijken — spaghetti, penne en meer.' },
  { slug: 'olijfolie',     label: 'Olijfolie',     searchTerms: ['olijfolie'],                category: 'overig',       description: 'Olijfolie aanbiedingen — extra vierge en gewone olie deals.' },
  { slug: 'zalm',          label: 'Zalm',          searchTerms: ['zalm'],                     category: 'vlees-vis',    description: 'Zalm in de aanbieding bij alle supermarkten — vers en gerookt.' },
  { slug: 'chips',         label: 'Chips',         searchTerms: ['chips'],                    category: 'snacks',       description: 'Chips aanbiedingen vergelijken — Lay\'s, Pringles en huismerk.' },
  { slug: 'cola',          label: 'Cola & Frisdrank', searchTerms: ['cola', 'fanta', 'sprite', 'pepsi'], category: 'dranken', description: 'Cola en frisdrank aanbiedingen vergelijken bij alle supermarkten.' },
  { slug: 'boter',         label: 'Boter & Margarine', searchTerms: ['boter', 'margarine'],  category: 'zuivel',       description: 'Boter en margarine in de aanbieding — roomboter en light varianten.' },
  { slug: 'eieren',        label: 'Eieren',        searchTerms: ['eier', 'eieren'],           category: 'zuivel',       description: 'Eieren aanbiedingen — 6 of 12 stuks, scharrel en biologisch.' },
  { slug: 'wijn',          label: 'Wijn',          searchTerms: ['wijn'],                     category: 'dranken',      description: 'Wijn aanbiedingen vergelijken — rode, witte en rosé deals.' },
  { slug: 'diepvries',     label: 'Diepvries',     searchTerms: ['diepvries', 'frozen'],      category: 'maaltijden',   description: 'Diepvriesproducten in de aanbieding bij alle supermarkten.' },
  { slug: 'shampoo',       label: 'Shampoo',       searchTerms: ['shampoo'],                  category: 'verzorging',   description: 'Shampoo aanbiedingen vergelijken — Kruidvat, AH en Jumbo.' },
]

export function getKeyword(slug: string): ProductKeyword | null {
  return PRODUCT_KEYWORDS.find(k => k.slug === slug) ?? null
}

export interface ProductKeywordData {
  keyword: ProductKeyword
  products: Product[]
  marketCount: number
  avgDiscount: number
  cheapestMarket: string | null
}

export async function getProductKeywordData(slug: string): Promise<ProductKeywordData | null> {
  const keyword = getKeyword(slug)
  if (!keyword) return null

  const all = await getProducts()
  const products = all.filter(p => {
    const name = p.name.toLowerCase()
    return keyword.searchTerms.some(t => name.includes(t.toLowerCase()))
      && p.originalPrice > p.discountedPrice
  })

  if (products.length === 0) return { keyword, products: [], marketCount: 0, avgDiscount: 0, cheapestMarket: null }

  const markets = [...new Set(products.map(p => p.market))]
  const avgDiscount = Math.round(products.reduce((s, p) => s + (p.discount ?? 0), 0) / products.length)
  const cheapest = [...products].sort((a, b) => a.discountedPrice - b.discountedPrice)[0]

  return {
    keyword,
    products: products.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0)),
    marketCount: markets.length,
    avgDiscount,
    cheapestMarket: cheapest?.market ?? null,
  }
}
