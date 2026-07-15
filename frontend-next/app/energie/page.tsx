import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'

const SLUG = 'energie'

const SUPPLIERS = [
  {
    name: 'ENGIE',
    market: 'ENGIE',
    tagline: 'Gevestigde energieleverancier met vaste én variabele contracten',
    color: '#0064A8',
    points: [
      'Keuze uit vast en variabel contract',
      'Landelijke dekking, grote klantenservice',
      'Ook zakelijke energie en laadpalen',
    ],
  },
  {
    name: 'Oxxio',
    market: 'Oxxio',
    tagline: 'Focus op lage vaste tarieven zonder poespas',
    color: '#E4002B',
    points: [
      'Bekend om scherpe vaste tarieven',
      'Alles-in-1 pakket (stroom + gas + slimme meter)',
      'Overstappen zonder eigen bezoek — Oxxio regelt het',
    ],
  },
  {
    name: 'Pure Energie',
    market: 'Pure Energie',
    tagline: '100% Nederlandse groene stroom van eigen windmolens en zonneparken',
    color: '#F7941D',
    points: [
      'Groene stroom met Nederlandse oorsprongsgarantie',
      'Transparante tariefopbouw, geen verborgen kosten',
      'Klein en flexibel — vaak snel schakelen bij vragen',
    ],
  },
  {
    name: 'EnergyZero',
    market: 'EnergyZero',
    tagline: '100% dynamisch energiecontract — profiteer van uurprijzen',
    color: '#00C48C',
    points: [
      'Volledig dynamisch tarief, geen vaste opslag',
      'Slim energieverbruik lonend maken via uurprijzen',
      'Voor wie actief wil sturen op verbruik en besparen',
    ],
  },
]

const SOLAR = [
  {
    name: 'noSun',
    market: 'noSun',
    tagline: 'Zonnepanelen op maat voor thuis',
    color: '#F59B00',
  },
  {
    name: 'Renogy',
    market: 'Renogy',
    tagline: 'Zonnepanelen, accu\'s en off-grid oplossingen',
    color: '#E87722',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Energie Vergelijken 2026 ✓ Gas, Stroom & Zonnepanelen | DealHunter4U'
  const description = '✓ Vergelijk energieleveranciers (ENGIE, Oxxio, Pure Energie) en zonnepanelen-aanbieders op één plek. Vast of variabel contract, groene stroom en besparen op je energierekening.'
  const keywords = 'energie vergelijken, energieleverancier vergelijken, goedkoopste energieleverancier, overstappen energie, energie aanbieding, zonnepanelen vergelijken, groene stroom'

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://www.dealhunter4u.nl/${SLUG}`,
      siteName: 'DealHunter4U',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.dealhunter4u.nl/${SLUG}`,
    },
  }
}

const FAQS = [
  {
    question: 'Wanneer kun je overstappen van energieleverancier?',
    answer: 'In Nederland kun je op elk moment overstappen van energieleverancier, ook tijdens een lopend contract — al kan je huidige leverancier in dat geval opzegkosten in rekening brengen. Loopt je contract bijna af, dan is overstappen altijd kosteloos. De nieuwe leverancier regelt de overstap meestal binnen enkele weken.',
  },
  {
    question: 'Wat is het verschil tussen een vast en variabel energiecontract?',
    answer: 'Bij een vast contract liggen de tarieven voor gas en stroom voor de hele looptijd (meestal 1-3 jaar) vast, ongeacht marktschommelingen. Bij een variabel contract volgen de tarieven de energiemarkt en kunnen ze maandelijks wijzigen. Vast geeft zekerheid, variabel kan voordeliger zijn als de marktprijzen dalen.',
  },
  {
    question: 'Is overstappen van energieleverancier nog steeds voordelig?',
    answer: 'Ja. Ook met een overheidsprijsplafond of energiebelasting blijven de tarieven tussen leveranciers verschillen — vooral tussen vaste en variabele contracten en tussen grote en kleinere aanbieders. Vergelijken kost een paar minuten en kan structureel schelen op je jaarrekening.',
  },
  {
    question: 'Loont zonnepanelen nog in 2026?',
    answer: 'Zonnepanelen blijven in de meeste gevallen renderen, al is de terugverdientijd afhankelijk van je energieverbruik, dakligging en de huidige salderingsregeling. Een offerte op maat (bijvoorbeeld via noSun) geeft het duidelijkste beeld van de terugverdientijd voor jouw situatie.',
  },
]

export default function EnergiePage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Energie Vergelijken', url: `/${SLUG}` },
  ])
  const faqSchema = buildFaqSchema(FAQS)

  return (
    <div style={{ background: '#F5EDE3', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* NAV */}
      <nav style={{ background: '#1A1A1A', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Deal</span>Hunter<span style={{ background: '#C41230', padding: '2px 7px', borderRadius: 5, fontSize: 13, marginLeft: 6 }}>4U</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>⚡ Energie</span>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8C8478', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#8C8478', textDecoration: 'none' }}>DealHunter</Link>
          <span>›</span>
          <span style={{ color: '#1A1A1A' }}>Energie Vergelijken</span>
        </nav>

        {/* Hero */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900, color: '#1A1A1A',
          lineHeight: 1.15, marginBottom: 16,
          fontFamily: 'Playfair Display, Georgia, serif',
          letterSpacing: '-0.02em',
        }}>
          ⚡ Energie Vergelijken 2026
        </h1>
        <p style={{ fontSize: 17, color: '#6B6259', lineHeight: 1.7, maxWidth: 640, marginBottom: 40 }}>
          Gas- en stroomprijzen verschillen per leverancier en per contractvorm. Vergelijk hieronder de energieleveranciers en zonnepanelen-aanbieders die DealHunter4U aanbeveelt — en bekijk direct hun huidige actie.
        </p>

        {/* Energieleveranciers */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
            Energieleveranciers vergelijken
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {SUPPLIERS.map(s => (
              <div key={s.name} style={{
                background: 'white', borderRadius: 20, padding: '24px 28px',
                border: '1px solid rgba(201,193,182,0.4)', boxShadow: '0 2px 0 #DDD0C4',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}>
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                    <span style={{ fontWeight: 900, fontSize: 18, color: '#1A1A1A' }}>{s.name}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#6B6259', marginBottom: 10 }}>{s.tagline}</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6B6259', lineHeight: 1.8 }}>
                    {s.points.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
                <Link
                  href={`/go?m=${encodeURIComponent(s.market)}`}
                  style={{
                    flex: '0 0 auto', background: s.color, color: 'white',
                    padding: '12px 24px', borderRadius: 30, textDecoration: 'none',
                    fontWeight: 900, fontSize: 14, letterSpacing: 0.5, whiteSpace: 'nowrap',
                  }}
                >
                  Vergelijk tarief →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Zonnepanelen */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
            Zonnepanelen: eigen energie opwekken
          </h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {SOLAR.map(s => (
              <div key={s.name} style={{
                background: 'white', borderRadius: 20, padding: '20px 24px',
                border: '1px solid rgba(201,193,182,0.4)', boxShadow: '0 2px 0 #DDD0C4',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 900, fontSize: 16, color: '#1A1A1A' }}>{s.name}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6B6259', marginBottom: 14 }}>{s.tagline}</p>
                <Link
                  href={`/go?m=${encodeURIComponent(s.market)}`}
                  style={{
                    display: 'inline-block', background: s.color, color: 'white',
                    padding: '10px 20px', borderRadius: 30, textDecoration: 'none',
                    fontWeight: 900, fontSize: 13,
                  }}
                >
                  Bekijk aanbod →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Editoriale content */}
        <div
          style={{ background: 'white', borderRadius: 20, padding: '36px 40px', boxShadow: '0 4px 0 #DDD0C4', border: '1px solid rgba(201,193,182,0.3)' }}
          className="blog-content"
        >
          <h2>Waarom energie vergelijken loont</h2>
          <p>Gas- en stroomtarieven verschillen per leverancier en per contractvorm — en het verschil tussen de goedkoopste en duurste aanbieder kan flink oplopen op je jaarrekening. Toch blijven veel huishoudens jarenlang bij dezelfde leverancier, ook als die niet meer de scherpste tarieven biedt. Vergelijken kost een paar minuten en is altijd de moeite waard, zeker rond het einde van je contract.</p>

          <h3>Vast of variabel: wat past bij jou?</h3>
          <p>Een <strong>vast contract</strong> geeft zekerheid: je tarief staat vast voor de hele looptijd, ongeacht wat er op de energiemarkt gebeurt. Een <strong>variabel contract</strong> beweegt mee met de markt — dat kan voordeliger zijn als prijzen dalen, maar ook duurder als ze stijgen. Wie zekerheid boven alles stelt, kiest vast. Wie wil profiteren van dalende marktprijzen en risico kan dragen, overweegt variabel.</p>

          <h3>Groene stroom: niet elke leverancier is gelijk</h3>
          <p>Bijna elke leverancier verkoopt tegenwoordig "groene stroom", maar de herkomst verschilt sterk. Sommige leveranciers kopen buitenlandse garanties van oorsprong in, andere — zoals Pure Energie — leveren stroom van eigen Nederlandse windmolens en zonneparken. Let op de herkomst als duurzaamheid voor jou zwaar weegt.</p>

          <h3>Overstappen: hoe werkt het?</h3>
          <p>Overstappen van energieleverancier is in Nederland altijd mogelijk en de nieuwe leverancier regelt vrijwel het hele proces voor je — inclusief opzegging bij je huidige leverancier. Zit je nog middenin een contract, dan kan opzegvergoeding gelden; loopt je contract bijna af, dan is overstappen kosteloos. Reken op enkele weken doorlooptijd voordat de overstap actief is.</p>

          <h3>Zonnepanelen als aanvulling</h3>
          <p>Naast het vergelijken van leveranciers kun je met zonnepanelen een deel van je energieverbruik zelf opwekken. De terugverdientijd hangt af van je dakligging, verbruik en de actuele salderingsregeling — een offerte op maat geeft het duidelijkste beeld. Voor kleinschalige of mobiele opwek (camper, tuinhuis, off-grid) zijn losse panelen en accu's van aanbieders als Renogy een laagdrempeliger instap.</p>

          <p>→ <Link href="/">Bekijk ook alle actuele supermarktaanbiedingen</Link> op DealHunter4U.</p>
        </div>

        {/* Verdiepende gidsen */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A1A', marginBottom: 16, fontFamily: 'Space Grotesk, sans-serif' }}>
            Lees ook
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { href: '/blog/energie-vergelijken-gids-2026', title: 'Energie vergelijken 2026: complete gids' },
              { href: '/blog/vast-of-variabel-energiecontract', title: 'Vast of variabel energiecontract: wat kies je?' },
              { href: '/blog/zonnepanelen-terugverdientijd-2026', title: 'Zonnepanelen terugverdientijd: loont het nog?' },
            ].map(g => (
              <Link key={g.href} href={g.href} style={{
                display: 'block', borderRadius: 16, padding: '16px 20px',
                background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none',
              }}>
                <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, color: '#1A1A1A', marginBottom: 8 }}>{g.title}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#E33D26' }}>Lees meer →</span>
              </Link>
            ))}
          </div>
        </section>
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
