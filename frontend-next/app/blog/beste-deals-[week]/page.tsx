import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/api'
import { MARKETS, MARKET_COLORS } from '@/lib/types'
import { buildBreadcrumbSchema } from '@/lib/schema'
import { parseWeekSlug, currentWeekSlug, getTopDeals } from '@/lib/weeklyDeals'

export const revalidate = 3600

interface Props {
  params: Promise<{ week: string }>
}

export async function generateStaticParams() {
  return [{ week: currentWeekSlug() }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { week } = await params
  const parsed = parseWeekSlug(week)
  if (!parsed) return {}

  const title = `Beste Supermarkt Deals Week ${parsed.week} ${parsed.year} — Top 15 Aanbiedingen`
  const description = `De 15 beste supermarkt aanbiedingen van week ${parsed.week} ${parsed.year}. Vergelijk kortingen van Albert Heijn, Jumbo, Lidl, Aldi en meer op DealHunter4U.`

  return {
    title: `${title} | DealHunter4U`,
    description,
    alternates: { canonical: `https://www.dealhunter4u.nl/blog/beste-deals-${week}` },
    openGraph: {
      title,
      description,
      url: `https://www.dealhunter4u.nl/blog/beste-deals-${week}`,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['DealHunter4U'],
      images: [{ url: 'https://www.dealhunter4u.nl/icon-512x512.png', width: 512, height: 512 }],
    },
  }
}

export default async function WeeklyDealsPage({ params }: Props) {
  const { week } = await params
  const parsed = parseWeekSlug(week)
  if (!parsed) notFound()

  const allProducts = await getProducts()
  const topDeals = getTopDeals(allProducts, 15)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: `Beste Deals Week ${parsed.week}`, url: `/blog/beste-deals-${week}` },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Beste Supermarkt Deals Week ${parsed.week} ${parsed.year}`,
    description: `De 15 beste supermarkt aanbiedingen van week ${parsed.week} ${parsed.year}.`,
    image: 'https://www.dealhunter4u.nl/icon-512x512.png',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'DealHunter4U', url: 'https://www.dealhunter4u.nl' },
    publisher: {
      '@type': 'Organization',
      name: 'DealHunter4U',
      logo: { '@type': 'ImageObject', url: 'https://www.dealhunter4u.nl/icon-512x512.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.dealhunter4u.nl/blog/beste-deals-${week}` },
  }

  return (
    <div style={{ background: '#F5EDE3', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* NAV */}
      <nav style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Deal</span>Hunter
          <span style={{ background: '#C41230', padding: '2px 7px', borderRadius: 5, fontSize: 13, marginLeft: 6 }}>4U</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Badge + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ background: '#E33D26', color: 'white', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
            Week {parsed.week}
          </span>
          <span style={{ color: '#9C9389', fontSize: 13 }}>{parsed.year}</span>
          <span style={{ color: '#9C9389', fontSize: 13 }}>· Automatisch bijgewerkt</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900, color: '#1A1A1A', lineHeight: 1.15, marginBottom: 16,
          fontFamily: 'Playfair Display, Georgia, serif', letterSpacing: '-0.02em',
        }}>
          Beste Supermarkt Deals<br />
          <span style={{ color: '#E33D26' }}>Week {parsed.week} {parsed.year}</span>
        </h1>

        <p style={{ color: '#6B6259', fontSize: 17, lineHeight: 1.65, marginBottom: 36 }}>
          Elke week verzamelt DealHunter4U automatisch de beste aanbiedingen van alle grote Nederlandse supermarkten.
          Hieronder vind je de <strong>top {topDeals.length} deals</strong> van deze week, gesorteerd op kortingspercentage.
        </p>

        {/* Deal list */}
        <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 0 #DDD0C4', border: '1px solid rgba(201,193,182,0.3)', overflow: 'hidden' }}>
          {topDeals.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center', color: '#9C9389' }}>
              Geen aanbiedingen beschikbaar. Kom later terug.
            </div>
          ) : topDeals.map((product, i) => {
            const pct = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
            const marketSlug = MARKETS.find(m => m.name === product.market)?.slug ?? ''
            const color = MARKET_COLORS[product.market] ?? '#1A1A1A'

            return (
              <div
                key={product.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 24px',
                  borderBottom: i < topDeals.length - 1 ? '1px solid #F0EBE5' : 'none',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? '#E33D26' : '#F0EBE5',
                  color: i < 3 ? 'white' : '#6B6259',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 13,
                }}>
                  {i + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9C9389', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {product.market}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </p>
                </div>

                {/* Price + badge */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#C9C1B6', textDecoration: 'line-through' }}>
                    €{product.originalPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#1A1A1A' }}>
                    €{product.discountedPrice.toFixed(2)}
                  </div>
                </div>

                <div style={{
                  background: '#E33D26', color: 'white',
                  fontSize: 12, fontWeight: 900,
                  padding: '4px 8px', borderRadius: 8, flexShrink: 0,
                }}>
                  -{pct}%
                </div>

                {marketSlug && (
                  <Link
                    href={`/supermarkt/${marketSlug}`}
                    style={{ color: color, fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
                  >
                    Bekijk →
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Market links */}
        <div style={{ marginTop: 40, padding: '28px 32px', background: '#1A1A1A', borderRadius: 20 }}>
          <p style={{ color: 'white', fontWeight: 900, fontSize: 17, marginBottom: 8 }}>
            Alle deals van alle supermarkten
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>
            Vergelijk direct welke supermarkt de beste deal heeft voor jouw boodschappen.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MARKETS.map(m => (
              <Link key={m.slug} href={`/supermarkt/${m.slug}`} style={{
                padding: '8px 14px', borderRadius: 20, textDecoration: 'none',
                fontSize: 13, fontWeight: 700, color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderLeft: `3px solid ${m.color}`,
              }}>
                {m.name}
              </Link>
            ))}
          </div>
          <Link href="/" style={{
            display: 'inline-block', marginTop: 20,
            background: '#E33D26', color: 'white',
            padding: '12px 28px', borderRadius: 30, textDecoration: 'none',
            fontWeight: 900, fontSize: 14, letterSpacing: 1,
          }}>
            Bekijk alle actuele deals →
          </Link>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/blog" style={{ color: '#6B6259', textDecoration: 'none', fontSize: 14 }}>
            ← Terug naar het blog
          </Link>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', borderTop: '1px solid #F0E6DE', fontSize: 13, color: '#888' }}>
        <div style={{ marginBottom: 12 }}>
          <Link href="/privacy" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Privacybeleid</Link>
          <Link href="/contact" style={{ color: '#E33D26', textDecoration: 'none', marginRight: 24 }}>Contact</Link>
          <Link href="/blog" style={{ color: '#E33D26', textDecoration: 'none' }}>Blog</Link>
        </div>
        <div>© {new Date().getFullYear()} DealHunter4U — Alle supermarkt aanbiedingen op één plek</div>
      </footer>
    </div>
  )
}
