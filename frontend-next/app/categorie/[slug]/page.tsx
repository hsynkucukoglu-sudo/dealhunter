import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductsByCategory } from '@/lib/api'
import { CATEGORIES } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema, buildMultiMarketProductListSchema } from '@/lib/schema'
import { CategoryPage } from '@/components/CategoryPage'
import { getPostsByCategory } from '@/lib/posts'
import { CATEGORY_FAQS } from '@/lib/categoryFaqs'

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string }> = {
  'groente-fruit': {
    title: 'Groente & Fruit Aanbiedingen Deze Week | AH, Jumbo, Lidl, Dirk',
    description: 'Vergelijk alle actuele groente & fruit aanbiedingen van AH, Jumbo, Lidl, Aldi en Dirk. Dagelijks bijgewerkt — bespaar tot 40% op verse groente en fruit. Geen folder nodig.',
    keywords: 'groente aanbieding, fruit aanbieding, groente en fruit supermarkt, goedkope groente, groente aanbiedingen deze week, fruit aanbiedingen supermarkt',
  },
  'zuivel': {
    title: 'Zuivel Aanbiedingen Deze Week | Kaas, Melk & Yoghurt Kortingen',
    description: 'Alle actuele zuivel aanbiedingen — kaas, melk, boter, yoghurt en kwark — van AH, Jumbo, Lidl en meer. 1+1 gratis en 2e halve prijs deals. Dagelijks bijgewerkt.',
    keywords: 'zuivel aanbieding, kaas aanbieding supermarkt, melk aanbieding, yoghurt aanbieding, zuivel aanbiedingen deze week, goedkope zuivel',
  },
  'vlees-vis': {
    title: 'Vlees & Vis Aanbiedingen Deze Week | Laagste Prijzen Vergelijken',
    description: 'Vergelijk alle vlees & vis aanbiedingen van AH, Jumbo, Lidl, Dirk en Aldi. Kipfilet, gehakt, zalmfilet en meer — tot 50% korting. Dagelijks bijgewerkt, geen folder nodig.',
    keywords: 'vlees aanbieding, vis aanbieding supermarkt, kipfilet aanbieding, gehakt aanbieding, vlees aanbiedingen deze week, goedkoop vlees supermarkt',
  },
  'dranken': {
    title: 'Dranken Aanbiedingen Deze Week | Bier, Wijn & Frisdrank Kortingen',
    description: 'Alle actuele dranken aanbiedingen — bier, wijn, frisdrank en water — van Dirk, AH, Jumbo, Aldi en DekaMarkt. Kratprijzen vergelijken, bespaar tot 40%. Dagelijks bijgewerkt.',
    keywords: 'dranken aanbieding, bier aanbieding supermarkt, frisdrank aanbieding, wijn aanbieding, dranken aanbiedingen deze week, goedkoop bier supermarkt',
  },
  'bakkerij': {
    title: 'Bakkerij Aanbiedingen Deze Week | Brood & Ontbijt Kortingen',
    description: 'Vergelijk alle bakkerij aanbiedingen — brood, croissants, ontbijtkoek en bakproducten — van AH, Jumbo, Lidl en meer. Tot 30% korting. Dagelijks bijgewerkt.',
    keywords: 'bakkerij aanbieding, brood aanbieding supermarkt, ontbijt aanbieding, bakkerij aanbiedingen deze week, goedkoop brood supermarkt',
  },
  'snacks': {
    title: 'Snack Aanbiedingen Deze Week | Chips, Koek & Noten Kortingen',
    description: 'Alle actuele snack aanbiedingen — chips, koek, noten en snoep — van AH, Jumbo, Lidl, Aldi en meer. 1+1 gratis en 2e halve prijs deals. Dagelijks bijgewerkt.',
    keywords: 'snack aanbieding, chips aanbieding supermarkt, noten aanbieding, koek aanbieding, snack aanbiedingen deze week, goedkope snacks supermarkt',
  },
  'maaltijden': {
    title: 'Maaltijden Aanbiedingen Deze Week | Kant-en-Klaar & Pizza Kortingen',
    description: 'Vergelijk alle maaltijden aanbiedingen — pizza, kant-en-klaar, pasta en sauzen — van AH, Jumbo, Lidl en Dirk. Tot 40% korting. Dagelijks bijgewerkt.',
    keywords: 'maaltijden aanbieding, pizza aanbieding supermarkt, kant en klaar aanbieding, pasta aanbieding, maaltijden aanbiedingen deze week',
  },
  'verzorging': {
    title: 'Verzorging Aanbiedingen Deze Week | Drogisterij & Beauty Kortingen',
    description: 'Alle actuele verzorging aanbiedingen — shampoo, douchegel, tandpasta, huidverzorging — van Kruidvat, AH, Jumbo en meer. Tot 50% korting. Dagelijks bijgewerkt.',
    keywords: 'verzorging aanbieding, shampoo aanbieding supermarkt, drogisterij aanbieding, huidverzorging aanbieding, verzorging aanbiedingen deze week',
  },
  'huishouden': {
    title: 'Huishouden Aanbiedingen Deze Week | Wasmiddel & Schoonmaak Kortingen',
    description: 'Vergelijk alle huishoud aanbiedingen — wasmiddel, afwasmiddel, schoonmaakmiddelen en keukenpapier — van Kruidvat, AH, Jumbo en Lidl. Tot 50% korting. Dagelijks bijgewerkt.',
    keywords: 'huishouden aanbieding, wasmiddel aanbieding supermarkt, schoonmaakmiddel aanbieding, huishoud aanbiedingen deze week, goedkoop wasmiddel',
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ slug: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  if (!cat) return {}

  const meta = CATEGORY_META[slug]
  const title = meta?.title ?? `${cat.label} Aanbiedingen Deze Week | DealHunter`
  const description = meta?.description ?? `Bekijk alle actuele ${cat.label} aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Vergelijk prijzen en bespaar op ${cat.label.toLowerCase()}.`
  const keywords = meta?.keywords ?? `${cat.label.toLowerCase()} aanbieding, ${cat.label.toLowerCase()} supermarkt, goedkope ${cat.label.toLowerCase()}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://www.dealhunter4u.nl/categorie/${slug}`,
      siteName: 'DealHunter',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.dealhunter4u.nl/categorie/${slug}`,
    },
  }
}

export default async function CategoriePageRoute({ params }: Props) {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  if (!cat) notFound()

  const products = await getProductsByCategory(slug)
  const relatedPosts = getPostsByCategory(slug)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categorieën', url: '/categorie' },
    { name: `${cat.label} Aanbiedingen`, url: `/categorie/${slug}` },
  ])
  const faqs = CATEGORY_FAQS[slug] ?? []
  const faqSchema = faqs.length ? buildFaqSchema(faqs) : null
  const productListSchema = products.length > 0
    ? buildMultiMarketProductListSchema(products, `${cat.label} Aanbiedingen`, `/categorie/${slug}`)
    : null

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
      {productListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      )}
      <CategoryPage category={cat} initialProducts={products} relatedPosts={relatedPosts} />
    </>
  )
}
