import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/api'
import { buildBreadcrumbSchema, buildFaqSchema, getISOWeek } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ProductCard } from '@/components/ProductCard'
import { SiteFooter } from '@/components/SiteFooter'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aanbiedingen Volgende Week ✓ Vroeg Weten Wat Er In Aanbieding Is | DealHunter4U',
  description: 'Welke supermarkt heeft volgende week de beste aanbiedingen? DealHunter4U toont vroeg bekende deals + stuur je een melding zodra de nieuwe folder live is.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/volgende-week' },
  openGraph: {
    title: 'Aanbiedingen Volgende Week — DealHunter4U',
    description: 'Vroeg weten welke deals er volgende week zijn? Meld je aan voor een gratis weekalert.',
    url: 'https://www.dealhunter4u.nl/volgende-week',
    siteName: 'DealHunter4U',
    locale: 'nl_NL',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'Wanneer weet ik de aanbiedingen van volgende week?',
    answer: 'De meeste supermarkten publiceren hun nieuwe folder op woensdag (Albert Heijn, Jumbo, Dirk) of maandag (Lidl, Aldi). DealHunter4U verwerkt de nieuwe deals zodra ze beschikbaar zijn — meld je aan voor een weekalert en je bent als eerste op de hoogte.',
  },
  {
    question: 'Kan ik alvast zien wat Lidl volgende week in aanbieding heeft?',
    answer: 'Lidl en Aldi publiceren hun folder soms vroeg, soms pas op maandagochtend. Zodra DealHunter4U de nieuwe Lidl deals oppikt, verschijnen ze automatisch op de site. Met een weekalert (gratis, geen account nodig) krijg je een e-mail zodra de nieuwe folder online staat.',
  },
  {
    question: 'Hoe werkt de weekalert van DealHunter4U?',
    answer: 'Je geeft je e-mailadres op via het formulier op deze pagina. Elke maandag sturen we je een overzicht van de beste deals van die week — helemaal gratis, geen account nodig. Uitschrijven kan altijd met één klik.',
  },
  {
    question: 'Welke supermarkten worden volgende week bijgewerkt?',
    answer: 'DealHunter4U scrapet wekelijks Albert Heijn, Jumbo, Lidl, Aldi, Dirk, Hoogvliet, Vomar, DekaMarkt, Plus en Kruidvat. Maandag starten Lidl en Aldi, woensdag volgen AH, Jumbo en de rest.',
  },
]

export default async function VolgendeWeekPage() {
  const allProducts = await getProducts()
  const week = getISOWeek(new Date())
  const nextWeek = week + 1

  // Show deals expiring at end of this week (likely last-chance deals before next rotation)
  const expiringThisWeek = allProducts
    .filter(p => {
      if (!p.expiresAt) return false
      const exp = new Date(p.expiresAt)
      const now = new Date()
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000)
      return daysLeft >= 0 && daysLeft <= 3
    })
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .slice(0, 6)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Aanbiedingen Volgende Week', url: '/volgende-week' },
  ])
  const faqSchema = buildFaqSchema(FAQS)

  const MARKETS_SCHEDULE = [
    { name: 'Lidl', day: 'Maandag', color: '#0050AA' },
    { name: 'Aldi', day: 'Maandag', color: '#1B3A7A' },
    { name: 'Albert Heijn', day: 'Woensdag', color: '#00A0E2' },
    { name: 'Jumbo', day: 'Woensdag', color: '#FFB800' },
    { name: 'Dirk', day: 'Woensdag', color: '#E4002B' },
    { name: 'Hoogvliet', day: 'Woensdag', color: '#164194' },
    { name: 'Vomar', day: 'Woensdag', color: '#FF6600' },
    { name: 'DekaMarkt', day: 'Woensdag', color: '#009640' },
    { name: 'Plus', day: 'Woensdag', color: '#E4002B' },
    { name: 'Kruidvat', day: 'Woensdag', color: '#D50032' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <div className="flex items-center gap-3">
            <Link href="/"><DealHunterLogo height={32} /></Link>
            <span className="text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <span className="text-sm font-medium" style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>Volgende Week</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:opacity-70">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Aanbiedingen Volgende Week</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="font-bold leading-tight mb-3"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
          >
            Aanbiedingen Volgende Week
          </h1>
          <p className="text-base max-w-2xl" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
            Welke supermarkt heeft volgende week (week {nextWeek}) de beste deals? DealHunter4U verwerkt nieuwe folders zodra ze beschikbaar zijn.
            Meld je aan voor een gratis weekalert — als eerste op de hoogte.
          </p>
        </div>

        {/* Folder schedule */}
        <section className="mb-12">
          <h2 className="font-bold mb-4" style={{ fontSize: '1.1rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
            Wanneer verschijnt de nieuwe folder?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MARKETS_SCHEDULE.map(m => (
              <div
                key={m.name}
                className="rounded-2xl p-3 text-center"
                style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ background: m.color, opacity: 0.15 }}
                />
                <div className="font-bold text-sm" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>{m.name}</div>
                <div className="text-[11px] font-medium mt-0.5" style={{ color: m.color }}>{m.day}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter signup */}
        <section
          className="mb-12 rounded-3xl p-8 md:p-10"
          style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-none">📬</div>
            <div className="flex-1">
              <h2 className="font-bold mb-2" style={{ fontSize: '1.2rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
                Weekalert — Gratis & Zonder Account
              </h2>
              <p className="text-sm mb-5" style={{ color: '#6B6259' }}>
                Elke maandag een e-mail met de beste deals van de week. Lidl &amp; Aldi maandag, AH &amp; Jumbo woensdag — wij houden het bij.
              </p>
              <form
                action={`${process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'}/api/newsletter/subscribe`}
                method="POST"
                className="flex flex-col sm:flex-row gap-3 max-w-md"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jouw@email.nl"
                  className="flex-1 px-4 py-3 rounded-full text-sm border outline-none"
                  style={{ borderColor: '#E0D8CE', background: '#FAFAF8', fontFamily: 'Hanken Grotesk', color: '#1A1A1A' }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ background: '#E33D26', color: 'white', fontFamily: 'Space Grotesk' }}
                >
                  Aanmelden →
                </button>
              </form>
              <p className="text-[11px] mt-2" style={{ color: '#B0A89E' }}>
                Gratis uitschrijven met één klik · Geen spam · Wekelijks
              </p>
            </div>
          </div>
        </section>

        {/* Expiring this week — "nog maar X dagen" */}
        {expiringThisWeek.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-xl" style={{ color: '#E33D26', fontVariationSettings: '"FILL" 1' }}>timer</span>
              <h2 className="font-bold" style={{ fontSize: '1.1rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
                Nog maar een paar dagen geldig — snel zijn!
              </h2>
            </div>
            <p className="text-sm mb-5" style={{ color: '#6B6259' }}>
              Deze deals verlopen binnenkort. Volgende week zijn er weer verse aanbiedingen.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {expiringThisWeek.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Bekijk huidige deals CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="font-bold mb-2" style={{ fontSize: '1.2rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
            Bekijk alle huidige aanbiedingen
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6B6259' }}>
            Week {week} deals zijn nu live — vergelijk alle supermarkten.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
              style={{ background: '#E33D26', color: 'white', textDecoration: 'none' }}
            >
              Bekijk week {week} →
            </Link>
            <Link
              href="/kortingsindex"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A', textDecoration: 'none' }}
            >
              Kortingsindex →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 rounded-3xl p-6 md:p-10" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="font-bold mb-6" style={{ fontSize: '1.2rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
            Veelgestelde vragen
          </h2>
          <div className="space-y-5">
            {FAQS.map(faq => (
              <div key={faq.question}>
                <p className="font-bold mb-1" style={{ color: '#1A1A1A' }}>{faq.question}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#5A534B' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
