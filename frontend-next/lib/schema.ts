import type { Product } from './types'
import { MARKETS } from './types'

const MARKET_SLUG: Record<string, string> = Object.fromEntries(
  MARKETS.map(m => [m.name, m.slug])
)

const SITE_URL = 'https://www.dealhunter4u.nl'

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith('ah-product-id:')) {
    const id = imageUrl.replace('ah-product-id:', '')
    return `${API_BASE}/api/ah-image/${id}`
  }
  return imageUrl
}

export function buildBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${SITE_URL}${crumb.url}`,
    })),
  }
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildSingleProductSchema(p: Product, marketSlug: string) {
  const resolvedImage = resolveImageUrl(p.imageUrl)
  const hasDiscount = p.originalPrice > p.discountedPrice
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: `${p.name} aanbieding bij ${p.market} – nu voor €${p.discountedPrice.toFixed(2)}`,
    ...(resolvedImage ? { image: resolvedImage } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/supermarkt/${marketSlug}`,
      priceCurrency: 'EUR',
      price: p.discountedPrice.toFixed(2),
      priceValidUntil: p.expiresAt,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: p.market },
      ...(hasDiscount ? {
        priceSpecification: [
          {
            '@type': 'UnitPriceSpecification',
            priceType: 'https://schema.org/ListPrice',
            price: p.originalPrice.toFixed(2),
            priceCurrency: 'EUR',
          },
          {
            '@type': 'UnitPriceSpecification',
            priceType: 'https://schema.org/SalePrice',
            price: p.discountedPrice.toFixed(2),
            priceCurrency: 'EUR',
            validThrough: p.expiresAt,
          },
        ],
      } : {}),
    },
  }
}

export function buildProductListSchema(
  products: Product[],
  marketName: string,
  marketSlug: string,
) {
  const week = getISOWeek(new Date())
  const withImage = products.filter(p => resolveImageUrl(p.imageUrl) !== null)
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${marketName} Aanbiedingen Week ${week}`,
    url: `${SITE_URL}/supermarkt/${marketSlug}`,
    numberOfItems: withImage.length,
    itemListElement: withImage.slice(0, 25).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: buildSingleProductSchema(p, marketSlug),
    })),
  }
}

export function buildHomeDealsSchema(products: Product[]) {
  const week = getISOWeek(new Date())
  const valid = products.filter(
    p => p.originalPrice > p.discountedPrice && p.discountedPrice > 0 && p.originalPrice > 0
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Beste supermarkt aanbiedingen week ${week} — Top deals Nederland`,
    url: SITE_URL,
    numberOfItems: Math.min(valid.length, 20),
    itemListElement: valid.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: buildSingleProductSchema(p, p.market ? (MARKET_SLUG[p.market] ?? p.market.toLowerCase().replace(/\s+/g, '-')) : 'onbekend'),
    })),
  }
}

export function buildHomePageSchema(markets: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DealHunter4U',
    url: SITE_URL,
    description: `Wekelijkse supermarkt aanbiedingen van ${markets}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
