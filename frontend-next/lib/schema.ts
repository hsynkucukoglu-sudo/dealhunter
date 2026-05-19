const SITE_URL = 'https://www.dealhunter4u.nl'

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith('ah-product-id:')) {
    const id = imageUrl.replace('ah-product-id:', '')
    return `https://dealhunter-production-d900.up.railway.app/api/ah-image/${id}`
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

export function buildHomePageSchema(markets: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DealHunter4U',
    url: SITE_URL,
    description: `Wekelijkse supermarkt aanbiedingen van ${markets}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
