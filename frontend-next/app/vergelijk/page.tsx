import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPairs } from '@/lib/vergelijk'
import { getISOWeek, buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MarketLogo } from '@/components/MarketLogo'

const week = getISOWeek(new Date())

export const metadata: Metadata = {
  title: `Supermarkten Vergelijken ${new Date().getFullYear()} ✓ Prijzen & Aanbiedingen Naast Elkaar`,
  description: '✓ Supermarkten vergelijken op prijs en aanbiedingen: AH, Jumbo, Lidl, Aldi, Dirk en meer naast elkaar. Vergelijk boodschappen en zie wie deze week het goedkoopst is.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/vergelijk' },
}

const FAQS = [
  {
    question: 'Hoe kan ik supermarkten vergelijken op prijs?',
    answer: 'Kies hieronder twee supermarkten en je ziet hun actuele aanbiedingen deze week naast elkaar — per product en per categorie. Zo vergelijk je de boodschappenprijzen zonder zelf folders door te bladeren. DealHunter4U verzamelt de weekaanbiedingen van alle grote Nederlandse supermarkten op één plek.',
  },
  {
    question: 'Welke supermarkt is het goedkoopst in Nederland?',
    answer: 'Op reguliere basisprijzen is Lidl gemiddeld het goedkoopst, gevolgd door Aldi en Dirk. Jumbo heeft de laagste basisprijzen van de grote full-service supermarkten en Albert Heijn wint vaak op diepe bonusaanbiedingen. Wie het goedkoopst uit is, vergelijkt de aanbiedingen per week — die wisselen constant.',
  },
  {
    question: 'Loont het om boodschappen te vergelijken tussen supermarkten?',
    answer: 'Ja. Het prijsverschil tussen de goedkoopste en duurste supermarkt loopt op basisproducten op tot 20–25%. Op een weekbudget van €150 is dat al snel €20–35 verschil. Door de aanbiedingen van meerdere supermarkten te vergelijken en je boodschappen te spreiden, bespaar je op jaarbasis honderden euro\'s.',
  },
  {
    question: 'Hoe vaak worden de aanbiedingen bijgewerkt?',
    answer: 'Elke week. De meeste supermarkten starten hun nieuwe aanbiedingen op maandag; sommige, zoals Albert Heijn, op woensdag. DealHunter4U werkt de prijzen dagelijks bij zodat je altijd de actuele weekaanbiedingen vergelijkt.',
  },
]

export default function VergelijkIndex() {
  const pairs = getAllPairs()
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Vergelijk', url: '/vergelijk' },
  ])
  const faqSchema = buildFaqSchema(FAQS)

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
          Supermarkten vergelijken op prijs en aanbiedingen — week {week}. Kies twee winkels
          en zie live welke supermarkt deze week de beste deals heeft op jouw boodschappen.
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

        <section className="max-w-3xl mt-20" style={{ color: '#3A342E', fontFamily: 'Hanken Grotesk' }}>
          <h2 className="font-headline font-bold mb-4" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
            Waarom supermarkten vergelijken loont
          </h2>
          <p className="mb-4 leading-relaxed">
            Nederlandse supermarkten verschillen flink in prijs. Op reguliere basisprijzen ligt de
            goedkoopste winkel al snel <strong>20 tot 25% onder de duurste</strong> — op een
            weekbudget van €150 scheelt dat €20 tot €35. Toch is de goedkoopste supermarkt niet
            elke week dezelfde: de aanbiedingen wisselen wekelijks, en juist daar zit de besparing.
            Door de <strong>prijzen en aanbiedingen naast elkaar te vergelijken</strong> zie je in
            één oogopslag waar jouw boodschappen deze week het voordeligst zijn.
          </p>
          <p className="mb-4 leading-relaxed">
            DealHunter4U verzamelt de weekaanbiedingen van alle grote supermarkten — Albert Heijn,
            Jumbo, Lidl, Aldi, Dirk, Plus en meer — en zet ze per product en per categorie naast
            elkaar. Geen folders doorbladeren, geen apps langslopen: één plek om
            <strong> boodschappen te vergelijken</strong> en direct de beste deal te pakken.
          </p>

          <h2 className="font-headline font-bold mb-4 mt-12" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
            Zo werkt supermarkten vergelijken
          </h2>
          <ol className="mb-4 leading-relaxed" style={{ paddingLeft: '1.25rem', listStyle: 'decimal' }}>
            <li className="mb-2">Kies hierboven de twee supermarkten die je wilt vergelijken.</li>
            <li className="mb-2">Bekijk hun actuele aanbiedingen van deze week naast elkaar, gesorteerd op korting.</li>
            <li className="mb-2">Filter op categorie — vlees, zuivel, groente, dranken — om gericht te vergelijken.</li>
            <li className="mb-2">Zie per product welke supermarkt goedkoper is en plan je boodschappen slim.</li>
          </ol>

          <h2 className="font-headline font-bold mb-6 mt-12" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
            Veelgestelde vragen
          </h2>
          <div className="flex flex-col gap-5">
            {FAQS.map(faq => (
              <div key={faq.question}>
                <h3 className="font-semibold mb-1.5" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk', fontSize: '1.02rem' }}>
                  {faq.question}
                </h3>
                <p className="leading-relaxed" style={{ color: '#6B6259' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
