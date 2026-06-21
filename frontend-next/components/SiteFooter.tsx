import Link from 'next/link'
import { VISIBLE_MARKETS as MARKETS, CATEGORIES } from '@/lib/types'
import { LanguageSwitcher } from './LanguageSwitcher'

export function SiteFooter() {
  return (
    <footer style={{ background: '#1A1A1A', color: '#C9C1B6' }} className="mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-headline font-bold" style={{ color: '#F5EDE3' }}>
                DealHunter
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#9C9389' }}>
              Vergelijk wekelijkse aanbiedingen van alle grote supermarkten in Nederland.
            </p>
          </div>

          {/* Supermarkten */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5EDE3' }}>
              Supermarkten
            </h3>
            <ul className="space-y-2">
              {MARKETS.map(m => (
                <li key={m.slug}>
                  <Link
                    href={`/supermarkt/${m.slug}`}
                    className="text-sm hover:text-white transition-colors"
                    style={{ color: '#9C9389' }}
                  >
                    {m.name} aanbiedingen
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorieën */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5EDE3' }}>
              Categorieën
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(c => (
                <li key={c.id}>
                  <Link
                    href={`/categorie/${c.id}`}
                    className="text-sm hover:text-white transition-colors"
                    style={{ color: '#9C9389' }}
                  >
                    {c.emoji} {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5EDE3' }}>
              Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Alle aanbiedingen
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Deals van de week
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Alle categorieën
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: '#9C9389' }}>
                  Privacybeleid
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: '#6B6259' }}
        >
          <span>© {new Date().getFullYear()} DealHunter. Alle rechten voorbehouden.</span>
          <div className="block sm:hidden">
            <LanguageSwitcher />
          </div>
          <span className="hidden sm:inline">Prijzen kunnen afwijken — controleer altijd bij de supermarkt.</span>
        </div>
      </div>
    </footer>
  )
}
