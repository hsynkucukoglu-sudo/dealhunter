import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/api'
import { VISIBLE_MARKETS, CATEGORIES } from '@/lib/types'
import { buildBreadcrumbSchema } from '@/lib/schema'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Perskit — DealHunter4U',
  description: 'Feiten, cijfers en contactgegevens over DealHunter4U voor journalisten en redacties.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/pers' },
}

export default async function PersPage() {
  const products = await getProducts()
  const dealCount = products.length
  const marketCount = VISIBLE_MARKETS.length
  const categoryCount = CATEGORIES.length

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pers', url: '/pers' },
  ])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Space Grotesk, sans-serif', color: '#1A1A1A', lineHeight: 1.8 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Link href="/" style={{ color: '#E33D26', textDecoration: 'none', fontSize: 14 }}>← Terug naar home</Link>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Perskit DealHunter4U</h1>
      <p style={{ color: '#666', fontSize: 18, marginBottom: 40 }}>
        Feiten, cijfers en contactgegevens voor journalisten en redacties.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>In het kort</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Actuele aanbiedingen', value: dealCount.toLocaleString('nl-NL') },
            { label: 'Supermarkten & winkels', value: String(marketCount) },
            { label: 'Talen', value: 'NL · EN · TR' },
            { label: 'Categorieën', value: String(categoryCount) },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#FFF8F6', border: '1.5px solid #F5E6C8', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#E33D26' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#9C9389' }}>
          Cijfers worden dagelijks automatisch bijgewerkt en zijn live op het moment van laden van deze pagina.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Wat is DealHunter4U?</h2>
        <p style={{ marginBottom: 16 }}>
          DealHunter4U verzamelt dagelijks automatisch de actuele aanbiedingen van de grootste Nederlandse
          supermarkten en drogisterijen — van Albert Heijn tot Kruidvat — en toont ze overzichtelijk op één plek.
          De site is beschikbaar in het Nederlands, Engels en Turks, en breidt daarnaast uit naar energie-,
          reis- en modeaanbiedingen.
        </p>
        <p style={{ marginBottom: 16 }}>
          Alle aanbiedingen komen rechtstreeks uit de officiële folders — geen AI-schattingen of verouderde
          data. Verlopen aanbiedingen verdwijnen automatisch, zodat bezoekers altijd alleen actuele deals zien.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Bronnen &amp; gebruik</h2>
        <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
          <li style={{ marginBottom: 8 }}>
            Cijfers van de <Link href="/kortingsindex" style={{ color: '#E33D26', fontWeight: 600 }}>DealHunter4U Kortingsindex</Link> zijn
            vrij te gebruiken in publicaties, met bronvermelding naar dealhunter4u.nl.
          </li>
          <li style={{ marginBottom: 8 }}>Meer over ons: <Link href="/over-ons" style={{ color: '#E33D26', fontWeight: 600 }}>Over ons</Link></li>
        </ul>
      </section>

      <section style={{ background: '#FFF8F6', border: '2px solid #F5E6C8', borderRadius: 16, padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Contact voor pers</h2>
        <p style={{ marginBottom: 12 }}>
          Voor interviewaanvragen, data-uitvragen of aanvullende cijfers, neem contact op.
        </p>
        <p>
          E-mail: <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26', fontWeight: 600 }}>info@dealhunter4u.nl</a>
        </p>
      </section>
    </div>
  )
}
