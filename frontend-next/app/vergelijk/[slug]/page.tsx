import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPairs, parsePairSlug, getMarketStats, getWinner, isIndexedPair } from '@/lib/vergelijk'
import { CATEGORY_LABELS } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema, getISOWeek } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MarketLogo } from '@/components/MarketLogo'
import { MarketFAQ } from '@/components/MarketFAQ'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPairs().map(p => ({ slug: p.slug }))
}

function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id]?.nl ?? id
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pair = parsePairSlug(slug)
  if (!pair) return {}
  const { a, b } = pair
  const week = getISOWeek(new Date())
  const url = `https://www.dealhunter4u.nl/vergelijk/${slug}`
  const title = `${a.name} vs ${b.name}: Wie Heeft de Beste Aanbiedingen? (Week ${week}) | DealHunter4U`
  const description = `✓ Vergelijk de actuele aanbiedingen van ${a.name} en ${b.name}. Gemiddelde korting, aantal deals en topdeals naast elkaar — wekelijks bijgewerkt.`

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: 'DealHunter4U', locale: 'nl_NL', type: 'website' },
    alternates: { canonical: url },
    // Sadece gerçek arama talebi olan ikililer indexlenir — kalan otomatik
    // kombinasyonlar ince/şablon içerik olarak AdSense reddine yol açıyordu.
    ...(isIndexedPair(slug) ? {} : { robots: { index: false, follow: true } }),
  }
}

export default async function VergelijkPage({ params }: Props) {
  const { slug } = await params
  const pair = parsePairSlug(slug)
  if (!pair) notFound()
  const { a, b } = pair

  const [sa, sb] = await Promise.all([getMarketStats(a), getMarketStats(b)])
  const winner = getWinner(a, sa, b, sb)
  const week = getISOWeek(new Date())

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Vergelijk', url: '/vergelijk' },
    { name: `${a.name} vs ${b.name}`, url: `/vergelijk/${slug}` },
  ])

  const faqs = [
    {
      question: `Wie heeft deze week de beste aanbiedingen: ${a.name} of ${b.name}?`,
      answer: winner
        ? `${winner.market.name} heeft deze week gemiddeld ${winner.stats.avgDiscount}% korting tegenover ${winner.loserStats.avgDiscount}% bij ${winner.loser.name} (week ${week}).`
        : `Deze week zijn ${a.name} en ${b.name} vergelijkbaar qua gemiddelde korting (week ${week}).`,
    },
    {
      question: `Hoeveel aanbiedingen heeft ${a.name} deze week?`,
      answer: sa.dealCount > 0
        ? `${a.name} heeft deze week ${sa.dealCount} actuele aanbiedingen, met kortingen tot ${sa.maxDiscount}%. De meeste deals vallen in de categorie ${categoryLabel(sa.topCategory)}.`
        : `${a.name} aanbiedingen worden op dit moment bijgewerkt.`,
    },
    {
      question: `Hoeveel aanbiedingen heeft ${b.name} deze week?`,
      answer: sb.dealCount > 0
        ? `${b.name} heeft deze week ${sb.dealCount} actuele aanbiedingen, met kortingen tot ${sb.maxDiscount}%. De meeste deals vallen in de categorie ${categoryLabel(sb.topCategory)}.`
        : `${b.name} aanbiedingen worden op dit moment bijgewerkt.`,
    },
    {
      question: `Wanneer wisselen de aanbiedingen van ${a.name} en ${b.name}?`,
      answer: 'De meeste supermarkten wisselen hun folder op zondag, maandag of woensdag. DealHunter4U wordt dagelijks bijgewerkt zodat je altijd de actuele deals ziet.',
    },
  ]
  const faqSchema = buildFaqSchema(faqs)

  const related = getAllPairs()
    .filter(p => p.slug !== slug && (p.a.slug === a.slug || p.b.slug === a.slug || p.a.slug === b.slug || p.b.slug === b.slug))
    .slice(0, 8)

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <div className="flex items-center gap-3">
            <Link href="/">
              <DealHunterLogo height={32} />
            </Link>
            <span className="text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>
              {a.name} vs {b.name}
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <Link href="/vergelijk" className="hover:text-primary transition-colors">Vergelijk</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>{a.name} vs {b.name}</span>
        </nav>

        <h1
          className="font-headline font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          {a.name} vs {b.name}: Wie Heeft de Beste Aanbiedingen?
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          Week {week} · live vergelijking op basis van actuele folderdata
        </p>

        {/* Winnaar */}
        <div
          className="rounded-3xl p-6 mb-10"
          style={{ background: 'white', border: `2px solid ${winner?.market.color ?? '#E0D8CE'}` }}
        >
          <p className="text-base md:text-lg font-semibold" style={{ color: '#1A1A1A', fontFamily: 'Hanken Grotesk' }}>
            {winner ? (
              <>
                🏆 Deze week wint <span style={{ color: winner.market.color }}>{winner.market.name}</span>:
                gemiddeld <strong>{winner.stats.avgDiscount}% korting</strong> tegenover {winner.loserStats.avgDiscount}% bij {winner.loser.name}.
              </>
            ) : (
              <>⚖️ Deze week zijn {a.name} en {b.name} vrijwel gelijk qua gemiddelde korting.</>
            )}
          </p>
        </div>

        {/* Statistiek tabel */}
        <div className="rounded-3xl overflow-hidden mb-10" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
          <div className="grid grid-cols-3 text-center">
            <div />
            <div className="py-4 font-bold flex items-center justify-center gap-2" style={{ color: a.color, fontFamily: 'Space Grotesk' }}>
              <MarketLogo market={a.name} size={24} />
              {a.name}
            </div>
            <div className="py-4 font-bold flex items-center justify-center gap-2" style={{ color: b.color, fontFamily: 'Space Grotesk' }}>
              <MarketLogo market={b.name} size={24} />
              {b.name}
            </div>
            <StatRow label="Aantal deals" va={sa.dealCount} vb={sb.dealCount} />
            <StatRow label="Gem. korting" va={`${sa.avgDiscount}%`} vb={`${sb.avgDiscount}%`} />
            <StatRow label="Hoogste korting" va={`${sa.maxDiscount}%`} vb={`${sb.maxDiscount}%`} />
            <StatRow label="1+1 Gratis acties" va={sa.onePlusOneCount} vb={sb.onePlusOneCount} />
            <StatRow label="Sterkste categorie" va={categoryLabel(sa.topCategory)} vb={categoryLabel(sb.topCategory)} />
          </div>
        </div>

        {/* Topdeals */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[{ m: a, s: sa }, { m: b, s: sb }].map(({ m, s }) => (
            <div key={m.slug} className="rounded-2xl p-5" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
              <h2 className="font-bold mb-2" style={{ color: m.color, fontFamily: 'Space Grotesk' }}>Topdeal bij {m.name}</h2>
              {s.topDeal ? (
                <p className="text-sm" style={{ color: '#1A1A1A', fontFamily: 'Hanken Grotesk' }}>
                  {s.topDeal.name} — <strong>€{s.topDeal.discountedPrice.toFixed(2)}</strong>{' '}
                  <span style={{ color: '#9C9389', textDecoration: 'line-through' }}>€{s.topDeal.originalPrice.toFixed(2)}</span>{' '}
                  <span className="font-bold" style={{ color: '#E33D26' }}>-{s.topDeal.discount}%</span>
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#9C9389' }}>Geen aanbiedingen beschikbaar.</p>
              )}
              <Link
                href={`/supermarkt/${m.slug}`}
                className="mt-3 inline-block text-sm font-semibold"
                style={{ color: '#E33D26' }}
              >
                Alle {s.dealCount} {m.name}-aanbiedingen bekijken →
              </Link>
            </div>
          ))}
        </div>

        {/* SEO tekst */}
        <section className="rounded-3xl p-6 md:p-8 mb-10" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="text-xl font-headline font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Hoe vergelijken we {a.name} en {b.name}?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            {a.description} {b.description} DealHunter4U verzamelt dagelijks alle folder-aanbiedingen van beide winkels
            — geen schattingen, maar echte actuele deals rechtstreeks uit de officiële folder. Deze week telt {a.name}{' '}
            {sa.dealCount} aanbiedingen en {b.name} {sb.dealCount}.
          </p>
        </section>

        <MarketFAQ faqs={faqs.map(f => ({ question: f.question, answer: f.answer }))} marketName={`${a.name} vs ${b.name}`} />

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>Andere vergelijkingen</h2>
            <div className="flex flex-wrap gap-3">
              {related.map(p => (
                <Link
                  key={p.slug}
                  href={`/vergelijk/${p.slug}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
                >
                  {p.a.name} vs {p.b.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function StatRow({ label, va, vb }: { label: string; va: string | number; vb: string | number }) {
  return (
    <>
      <div className="text-left text-sm py-3 px-6 border-t" style={{ color: '#6B6259', borderColor: '#E0D8CE' }}>{label}</div>
      <div className="py-3 border-t font-semibold text-sm" style={{ borderColor: '#E0D8CE', color: '#1A1A1A' }}>{va}</div>
      <div className="py-3 border-t font-semibold text-sm" style={{ borderColor: '#E0D8CE', color: '#1A1A1A' }}>{vb}</div>
    </>
  )
}
