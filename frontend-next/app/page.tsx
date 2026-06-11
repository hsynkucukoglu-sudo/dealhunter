import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { buildHomePageSchema, buildFaqSchema } from '@/lib/schema'
import { ProductsPage } from '@/components/ProductsPage'

const HOME_FAQS = [
  {
    question: 'Is DealHunter4U gratis te gebruiken?',
    answer: 'Ja, DealHunter4U is volledig gratis. Je kunt alle aanbiedingen bekijken, vergelijken en filteren zonder account. Een gratis account geeft je toegang tot favorieten en prijsmeldingen.',
  },
  {
    question: 'Welke supermarkten staan op DealHunter4U?',
    answer: 'Op dit moment vergelijken we de aanbiedingen van acht supermarkten: Albert Heijn, Jumbo, Lidl, Aldi, Dirk van den Broek, Hoogvliet, Vomar en DekaMarkt. We breiden het aanbod regelmatig uit.',
  },
  {
    question: 'Hoe vaak worden de aanbiedingen bijgewerkt?',
    answer: 'De aanbiedingen worden elke dag automatisch ververst. Nieuwe weekacties verschijnen doorgaans op maandag (Lidl, Aldi) en woensdag (Albert Heijn, Jumbo en de meeste andere supermarkten).',
  },
  {
    question: 'Kan ik zien hoeveel ik bespaar?',
    answer: 'Ja. Bij elk product zie je het kortingspercentage en de besparing ten opzichte van de normale prijs. Een "Laagste prijs"-label geeft aan welke supermarkt op dat moment het goedkoopst is voor een vergelijkbaar product.',
  },
]

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams
  if (q) {
    return { robots: { index: false, follow: true } }
  }
  return { alternates: { canonical: 'https://www.dealhunter4u.nl' } }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const allProducts = await getProducts()
  const markets = [...new Set(allProducts.map(p => p.market))].join(', ')
  const schema = buildHomePageSchema(markets)
  const faqSchema = buildFaqSchema(HOME_FAQS)

  // HTML boyutunu 1MB altında tutmak için sadece top 60 ürün SSR ile gönder.
  // Geri kalanlar ProductsPage içinde client-side API'den yüklenir.
  const initialProducts = allProducts
    .filter(p => p.originalPrice > p.discountedPrice && p.originalPrice > 0)
    .sort((a, b) => ((b.originalPrice - b.discountedPrice) / b.originalPrice) - ((a.originalPrice - a.discountedPrice) / a.originalPrice))
    .slice(0, 60)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductsPage initialProducts={initialProducts} initialSearch={q ?? ''} />
    </>
  )
}
