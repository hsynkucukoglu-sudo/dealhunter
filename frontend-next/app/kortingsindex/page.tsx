import type { Metadata } from 'next'
import Link from 'next/link'
import { getKortingsindex, getMonthLabel } from '@/lib/kortingsindex'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MarketLogo } from '@/components/MarketLogo'
import { MarketFAQ } from '@/components/MarketFAQ'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const month = getMonthLabel()
  // Geen "welke supermarkt heeft de hoogste korting" meer: die claim kan de data niet
  // dragen (verschillende scraperdekking per keten — zie lib/kortingsindex.ts).
  const title = `Kortingsindex ${month} — Actuele Aanbiedingen per Supermarkt | DealHunter4U`
  const description = `✓ Overzicht van de aanbiedingen die DealHunter4U deze week volgt per supermarkt: aantal deals, hoogste korting en 1+1 acties.`
  return {
    title,
    description,
    alternates: { canonical: 'https://www.dealhunter4u.nl/kortingsindex' },
    openGraph: { title, description, url: 'https://www.dealhunter4u.nl/kortingsindex', siteName: 'DealHunter4U', locale: 'nl_NL', type: 'website' },
  }
}

export default async function KortingsindexPage() {
  const entries = await getKortingsindex()
  const month = getMonthLabel()

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Kortingsindex', url: '/kortingsindex' },
  ])

  const faqs = [
    {
      question: 'Kun je supermarkten vergelijken op gemiddelde korting?',
      answer: 'Niet zomaar, en daarom presenteren wij geen ranglijst. Van de ene keten halen we alleen de kopdeals uit de folder op (enkele tientallen producten, dus hoge percentages), van de andere het volledige aanbod inclusief kleine kortingen (honderden producten). Een gemiddelde over die twee groepen meet vooral het verschil in wat wij ophalen. Het aantal deals per supermarkt staat er daarom altijd naast.',
    },
    {
      question: 'Wat is de DealHunter4U Kortingsindex?',
      answer: 'Een live overzicht van de aanbiedingen die DealHunter4U op dit moment volgt per Nederlandse supermarkt: het aantal deals, de hoogste korting die we vonden en het aantal 1+1-acties. De cijfers komen rechtstreeks uit de officiële folders van die week.',
    },
    {
      question: 'Hoe wordt de Kortingsindex berekend?',
      answer: 'Voor elke supermarkt berekenen we de gemiddelde en hoogste kortingspercentage over alle actuele aanbiedingen, plus het aantal 1+1 gratis acties. Geen schattingen — alle cijfers komen rechtstreeks uit de officiële folders van die week.',
    },
  ]
  const faqSchema = buildFaqSchema(faqs)

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
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>Kortingsindex</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Kortingsindex</span>
        </nav>

        <h1
          className="font-headline font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          DealHunter4U Kortingsindex
        </h1>
        <p className="text-base max-w-2xl mb-6" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          {month} — de aanbiedingen die wij deze week volgen per supermarkt, rechtstreeks uit de
          officiële folders. Alfabetisch, geen ranglijst.
        </p>

        {/* Bewust geen "kopploeg"-banner en geen sortering op gemiddelde korting: het aantal
            opgehaalde producten verschilt te sterk per keten om ketens op dat gemiddelde te
            kunnen ranken (zie lib/kortingsindex.ts). */}
        <div className="rounded-2xl p-4 mb-10" style={{ background: 'rgba(227,61,38,0.06)', border: '1.5px solid rgba(227,61,38,0.25)' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            <strong style={{ color: '#1A1A1A' }}>Let op bij het lezen:</strong> de gemiddelde korting is
            niet tussen supermarkten te vergelijken. Van sommige ketens volgen we enkele tientallen
            kopdeals, van andere honderden producten inclusief kleine kortingen. Kijk daarom altijd
            naar de kolom <em>Deals</em> ernaast.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden mb-10" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
          <div className="grid grid-cols-5 text-xs font-bold uppercase tracking-wide px-6 py-3" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono', borderBottom: '1.5px solid #E0D8CE' }}>
            <div>Supermarkt</div>
            <div className="text-center">Deals</div>
            <div className="text-center">Gem. korting</div>
            <div className="text-center">Hoogste korting</div>
            <div className="text-center">1+1 acties</div>
          </div>
          {entries.map((e, i) => (
            <Link
              key={e.slug}
              href={`/supermarkt/${e.slug}`}
              className="grid grid-cols-5 items-center px-6 py-4 transition-colors hover:bg-black/[0.02]"
              style={{ borderBottom: i < entries.length - 1 ? '1px solid #E0D8CE' : 'none', textDecoration: 'none' }}
            >
              {/* Geen rangnummer meer — dat las als "nr. 1 = beste korting" */}
              <div className="flex items-center gap-3">
                <MarketLogo market={e.market} size={28} />
                <span className="font-semibold text-sm" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>{e.market}</span>
              </div>
              <div className="text-center text-sm font-medium" style={{ color: '#1A1A1A' }}>{e.dealCount}</div>
              <div className="text-center text-sm font-bold" style={{ color: '#1B9E4B' }}>{e.avgDiscount}%</div>
              <div className="text-center text-sm font-medium" style={{ color: '#E33D26' }}>{e.maxDiscount}%</div>
              <div className="text-center text-sm font-medium" style={{ color: '#1A1A1A' }}>{e.onePlusOneCount}</div>
            </Link>
          ))}
        </div>

        <section className="rounded-3xl p-6 md:p-8 mb-10" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="text-xl font-headline font-bold mb-3" style={{ color: '#1A1A1A' }}>Methodologie</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            De Kortingsindex is gebaseerd op alle op dit moment geldige aanbiedingen die DealHunter4U dagelijks verzamelt
            uit de officiële folders van {entries.length} Nederlandse supermarkten.
          </p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            <strong style={{ color: '#1A1A1A' }}>Wat deze cijfers niet zijn:</strong> de dekking verschilt per keten.
            Van sommige supermarkten halen we alleen de kopdeals uit de folder op, van andere het volledige
            aanbod inclusief kleine kortingen. Daardoor is de gemiddelde korting wél te volgen binnen één
            supermarkt, maar niet te gebruiken om supermarkten onderling te ranken. Om diezelfde reden staat
            hier geen ranglijst en sorteren we alfabetisch.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            Voor journalisten: het aantal deals, de hoogste korting en het aantal 1+1-acties per supermarkt zijn
            vrij te gebruiken met bronvermelding naar dealhunter4u.nl. Neem de gemiddelde korting alleen over
            mét de bijbehorende kanttekening hierboven.{' '}
            <Link href="/pers" style={{ color: '#E33D26', fontWeight: 600 }}>Bekijk onze perskit →</Link>
          </p>
        </section>

        <MarketFAQ faqs={faqs} marketName="de Kortingsindex" />
      </main>
    </div>
  )
}
