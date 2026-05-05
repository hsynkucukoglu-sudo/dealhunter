import { Product } from './types'

const SITE_URL = 'https://www.dealhunter4u.nl'
const API_BASE_URL = 'https://dealhunter-production-d900.up.railway.app'

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith('ah-product-id:')) {
    const id = imageUrl.replace('ah-product-id:', '')
    return `${API_BASE_URL}/api/ah-image/${id}`
  }
  return imageUrl
}

function buildProductSchema(p: Product) {
  const image = resolveImageUrl(p.imageUrl)
  return {
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: p.market },
    ...(image ? { image } : {}),
    offers: {
      '@type': 'Offer',
      price: p.discountedPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: p.expiresAt,
      seller: { '@type': 'Organization', name: p.market },
    },
  }
}

export function buildItemListSchema(
  name: string,
  description: string,
  url: string,
  products: Product[],
  limit = 50,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: `${SITE_URL}${url}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, limit).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: buildProductSchema(p),
    })),
  }
}

export function buildHomePageSchema(products: Product[]) {
  const markets = [...new Set(products.map(p => p.market))].join(', ')
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DealHunter',
      url: SITE_URL,
      description: `Wekelijkse supermarkt aanbiedingen van ${markets}`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Beste Supermarkt Aanbiedingen',
      description: `Actuele aanbiedingen van ${markets}`,
      url: SITE_URL,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 50).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: buildProductSchema(p),
      })),
    },
  ]
}
