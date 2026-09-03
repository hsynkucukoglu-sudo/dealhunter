'use client'
import Link from 'next/link'
import { trackAffiliateClick } from '@/lib/analytics'

/**
 * Compacte "meer besparen"-strip voor blogposts.
 *
 * Waarom deze bestaat (gemeten 2026-08-29):
 * - GSC 28 dagen: ~68% van alle zoekklikken landt op blog-vergelijkingsposts,
 *   maar slechts ~14% op `/` of `/tr` — de enige routes waar ProductsPage (en
 *   dus de MeerBesparenWidget) draait. De hoogwaardige affiliate-links stonden
 *   dus niet op de pagina's waar het verkeer binnenkomt.
 * - Clarity 30 dagen: `meer_besparen_open` = 3 van 533 sessies (0,56%). De
 *   drawer op de homepage wordt praktisch nooit geopend, en met 1,12
 *   pagina's/sessie navigeert de blogbezoeker er ook niet heen.
 *
 * Plaatsing volgt bewust hetzelfde patroon als dealEmbed: binnen de eerste 32%
 * scrolldiepte, direct na de intro. Alles daaronder wordt aantoonbaar niet
 * gezien (zie de toelichting bij "Article body" in app/blog/[slug]/page.tsx).
 *
 * BEWUST KLEIN: die toelichting waarschuwt dat paginalengte precies het
 * probleem is dat we oplossen. Eén rij, vier kaarten, geen afbeeldingen.
 *
 * MEETBAARHEID (2026-09-03): deze strip linkt via /go, en /go stuurt alléén een
 * first-party beacon naar /api/track — géén Clarity-event. Daardoor bleef
 * `affiliate_click` in Clarity op 0 staan en leek de strip niets te doen, terwijl
 * we simpelweg het verkeerde instrument aflazen. Nu vuurt de strip zelf
 * `trackAffiliateClick(...)` met source 'blog-strip', zodat hij in Clarity
 * zichtbaar is én te onderscheiden van kliks uit de MeerBesparenWidget.
 *
 * Alleen programma's waarvoor de subscription ook echt `approved` is — op
 * 2026-08-29 bleek dat 14 links op de site naar niet-geabonneerde programma's
 * wezen en dus nul commissie opleverden (zie docs/genel-kontrol.md §8).
 * Voeg hier dus NIETS toe zonder de subscriptionstatus in het Daisycon-panel
 * te controleren.
 *
 * Stand 2026-09-03 (§13): Vattenfall is er inmiddels bij gekomen als `approved`
 * en kan hier dus veilig bij. Nog in review (`open`): Eneco, Monuta, DELA,
 * Nationale-Nederlanden, Sinner, Vitaminstore, De Vakantiediscounter.
 * Definitief niet bruikbaar en van de site verwijderd: ENGIE en Kwantum
 * (mediatype geweigerd), KPN (afgekeurd), Oxxio (eigen copy niet toegestaan),
 * ONVZ (programma bestaat niet meer).
 */

type SavingsItem = {
  /** Sleutel in AFFILIATE_MAP — /go lost hem daar op. */
  market: string
  label: string
  tagline: string
  color: string
}

const ITEMS: SavingsItem[] = [
  { market: 'Frank Energie', label: 'Frank Energie', tagline: 'Stroom & gas tegen inkoopprijs', color: '#00A651' },
  { market: 'Pure Energie',  label: 'Pure Energie',  tagline: 'Groene stroom uit Nederland',   color: '#3AAA35' },
  { market: 'Ziggo',         label: 'Ziggo',         tagline: 'Internet, TV & bellen',          color: '#FF6600' },
  { market: 'hollandsnieuwe', label: 'hollandsnieuwe', tagline: 'Voordelig mobiel abonnement',  color: '#00A650' },
]

export function BlogSavingsStrip() {
  return (
    <section
      aria-label="Meer besparen op vaste lasten"
      style={{ marginTop: 20, marginBottom: 4 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: 0 }}>
          Meer besparen op je vaste lasten
        </p>
        {/* Transparantie: dit zijn advertentielinks. Consistent met de
            AFM-tekst op /contact en met het affiliate-blok op /over-ons. */}
        <span style={{ fontSize: 11, color: '#8A8A8A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Advertentie
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8,
        }}
      >
        {ITEMS.map(item => (
          <Link
            key={item.market}
            href={`/go?m=${encodeURIComponent(item.market)}&c=blog`}
            rel="nofollow sponsored"
            onClick={() => trackAffiliateClick(item.label, 'vaste-lasten', 'blog-strip')}
            style={{
              display: 'block',
              padding: '10px 12px',
              borderRadius: 12,
              background: '#FFF8F6',
              border: '1px solid rgba(201,193,182,0.45)',
              borderLeft: `4px solid ${item.color}`,
              textDecoration: 'none',
              color: '#1A1A1A',
            }}
          >
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              {item.label}
            </span>
            <span style={{ display: 'block', fontSize: 12, color: '#6B6B6B', lineHeight: 1.35 }}>
              {item.tagline}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
