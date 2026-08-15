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

// Onder deze grens gaat de pagina op noindex en uit de sitemap.
//
// Deze pagina's zijn dynamisch: hoeveel producten ze tonen hangt af van de folder
// van die week. Gemeten op de live site 2026-08-15 (alle 20 slugs):
//
//   luiers 0 items / 305 woorden   diepvries 0 / 302   shampoo 1 / 345
//   airfryer 2 / 377               olijfolie 3 / 411   …   yoghurt 34 / 1.427
//
// De noindex-notitie in app/merk/[slug]/page.tsx voert /product/* op als
// tegenvoorbeeld met "671-1011 woorden" — dat klopte toen, maar bij 0-2 items
// zakt deze pagina naar 302-377 woorden en zit daarmee middenin de 342-396-band
// die daar juist als "te dun om te verdedigen" is afgeserveerd (AdSense-afwijzing
// 13-07-2026, "laagwaardige content").
//
// Concreet probleem bovenop de dunheid: de title belooft "Aanbieding Deze Week ✓
// Vergelijk Alle Winkels" terwijl de body "Momenteel geen actieve aanbiedingen
// gevonden" toont. Die belofte-breuk kost de klik én verdunt de sitebrede CTR
// (impressies zonder clicks) — zie docs/analiz-2026-08-15.md §3.
//
// 3 is de ondergrens waarboven de pagina de eigen belofte kan waarmaken: onder de
// 3 items is er niets te "vergelijken". De pagina blijft gewoon bereikbaar voor
// bezoekers — inclusief de deal-alert CTA, die juist op een lege pagina nuttig is.
// follow blijft aan, dus interne links tellen door (zelfde keuze als /merk/).
export const MIN_PRODUCTS_FOR_INDEX = 3

function matchProducts(keyword: ProductKeyword, all: Product[]): Product[] {
  return all.filter(p => {
    const name = p.name.toLowerCase()
    return keyword.searchTerms.some(t => name.includes(t.toLowerCase()))
      && p.originalPrice > p.discountedPrice
  })
}

/** Slugs die deze week genoeg aanbod hebben om ingediend te worden bij Google. */
export async function getIndexableProductSlugs(): Promise<string[]> {
  // Eén fetch voor alle 20 keywords — niet getProductKeywordData() per slug.
  const all = await getProducts()
  return PRODUCT_KEYWORDS
    .filter(k => matchProducts(k, all).length >= MIN_PRODUCTS_FOR_INDEX)
    .map(k => k.slug)
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
  const products = matchProducts(keyword, all)

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
