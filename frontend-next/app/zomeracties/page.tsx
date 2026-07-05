import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'
import { CategoryPage } from '@/components/CategoryPage'
import { CATEGORY_FAQS } from '@/lib/categoryFaqs'

// BBQ-vlees, ijs, zomerdrankjes, zomerfruit en salade-ingrediënten
const SUMMER_KEYWORDS = /hamburger|schnitzel|worst|spek|kipdrumstick|kippenvleugel|kipfilet|saté|satesaus|barbecue|bbq|marinade|bier|rosé wijn|rosé|prosecco|cava|sangria|ijsthee|ijskoffie|frisdrank|cola|limonade|tonic|\bsap\b|ijsje|\bijs\b|magnum|cornetto|waterijs|sorbet|aardbei|meloen|kersen|perzik|nectarine|tomaten?|komkommers?|\bsla\b/i

const SLUG = 'zomeracties'
const CATEGORY = { id: SLUG, label: 'Zomeracties', emoji: '☀️' }

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Zomeracties Supermarkt 2026 ✓ BBQ, IJs & Zomerdeals | DealHunter4U'
  const description = '✓ Alle actuele zomeracties op één plek: BBQ-vlees, ijs, zomerfruit en koele drankjes van AH, Jumbo, Lidl, Aldi, Dirk en meer. Dagelijks bijgewerkt, geen folder nodig.'
  const keywords = 'zomeractie supermarkt, bbq aanbieding, zomerdeals supermarkt, ijs aanbieding, zomerfruit aanbieding, bbq vlees aanbieding, zomeracties 2026'

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://www.dealhunter4u.nl/zomeracties',
      siteName: 'DealHunter4U',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: 'https://www.dealhunter4u.nl/zomeracties',
    },
  }
}

export default async function ZomeractiesPage() {
  const allProducts = await getProducts()
  const products = allProducts.filter(p => SUMMER_KEYWORDS.test(p.name))

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Zomeracties', url: `/${SLUG}` },
  ])
  const faqs = CATEGORY_FAQS[SLUG] ?? []
  const faqSchema = faqs.length ? buildFaqSchema(faqs) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <CategoryPage category={CATEGORY} initialProducts={products} />
    </>
  )
}
