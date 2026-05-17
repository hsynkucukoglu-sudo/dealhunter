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

function buildProductSchema(p: Product, image: string) {
  return {
    '@type': 'Product',
    name: p.name,
    image,
    brand: { '@type': 'Brand', name: p.market },
    offers: {
      '@type': 'Offer',
      price: p.discountedPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      ...(p.expiresAt ? { priceValidUntil: p.expiresAt } : {}),
      seller: { '@type': 'Organization', name: p.market },
    },
  }
}

// Only products with a resolvable image are included — prevents "image missing" errors in Search Console
function withImages(products: Product[]) {
  return products.flatMap(p => {
    const image = resolveImageUrl(p.imageUrl)
    return image ? [{ product: p, image }] : []
  })
}

export function buildItemListSchema(
  name: string,
  description: string,
  url: string,
  products: Product[],
  limit = 50,
) {
  const eligible = withImages(products).slice(0, limit)
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: `${SITE_URL}${url}`,
    numberOfItems: eligible.length,
    itemListElement: eligible.map(({ product, image }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: buildProductSchema(product, image),
    })),
  }
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

export function buildHomePageSchema(products: Product[]) {
  const markets = [...new Set(products.map(p => p.market))].join(', ')
  const eligible = withImages(products).slice(0, 50)
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
      numberOfItems: eligible.length,
      itemListElement: eligible.map(({ product, image }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: buildProductSchema(product, image),
      })),
    },
  ]
}
