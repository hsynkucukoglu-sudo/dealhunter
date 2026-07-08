import type { Metadata } from 'next'
import Link from 'next/link'
import { getBrandList } from '@/lib/brands'
import { getISOWeek, buildBreadcrumbSchema } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `Merken Aanbiedingen ${new Date().getFullYear()} ✓ Alle Merken op Één Plek | DealHunter4U`,
  description: '✓ Vind de beste aanbiedingen per merk bij alle Nederlandse supermarkten — van Campina tot Lay\'s. Wekelijks bijgewerkt.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/merk' },
}

export default async function BrandIndex() {
  const brands = await getBrandList()
  const week = getISOWeek(new Date())
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Merken', url: '/merk' },
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
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>Merken</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Merken</span>
        </nav>

        <h1
          className="font-headline font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          Merken Vergelijken
        </h1>
        <p className="text-base max-w-2xl mb-10" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          Week {week} — alle actuele aanbiedingen per merk, verzameld uit alle supermarkten.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {brands.map(b => (
            <Link
              key={b.slug}
              href={`/merk/${b.slug}`}
              className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all hover:shadow-md"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none' }}
            >
              <span className="font-semibold text-sm" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>{b.name}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(227,61,38,0.08)', color: '#E33D26', fontFamily: 'JetBrains Mono' }}>
                {b.count}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
