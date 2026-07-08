import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPairs } from '@/lib/vergelijk'
import { getISOWeek, buildBreadcrumbSchema } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MarketLogo } from '@/components/MarketLogo'

const week = getISOWeek(new Date())

export const metadata: Metadata = {
  title: `Supermarkten Vergelijken ${new Date().getFullYear()} ✓ Alle Aanbiedingen Naast Elkaar | DealHunter4U`,
  description: '✓ Vergelijk de aanbiedingen van alle Nederlandse supermarkten: AH vs Jumbo, Lidl vs Aldi en meer. Wie heeft deze week de beste deals?',
  alternates: { canonical: 'https://www.dealhunter4u.nl/vergelijk' },
}

export default function VergelijkIndex() {
  const pairs = getAllPairs()
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Vergelijk', url: '/vergelijk' },
  ])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

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
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>Vergelijk</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Vergelijk</span>
        </nav>

        <h1
          className="font-headline font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          Supermarkten Vergelijken
        </h1>
        <p className="text-base max-w-2xl mb-10" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          Week {week} — kies een vergelijking en zie live welke supermarkt deze week de beste aanbiedingen heeft.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pairs.map(p => (
            <Link
              key={p.slug}
              href={`/vergelijk/${p.slug}`}
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none' }}
            >
              <div className="flex items-center -space-x-2">
                <MarketLogo market={p.a.name} size={36} />
                <MarketLogo market={p.b.name} size={36} />
              </div>
              <span className="font-semibold text-sm" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
                {p.a.name} <span style={{ color: '#9C9389', fontWeight: 400 }}>vs</span> {p.b.name}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
