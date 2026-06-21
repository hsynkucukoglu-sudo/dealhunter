import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Over Ons — DealHunter4U',
  description: 'Leer meer over DealHunter4U: wie we zijn, wat onze missie is en hoe wij u helpen elke week te besparen op uw boodschappen bij Nederlandse supermarkten.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/over-ons' },
}

export default function OverOnsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Space Grotesk, sans-serif', color: '#1A1A1A', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: '#E33D26', textDecoration: 'none', fontSize: 14 }}>← Terug naar home</Link>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Over DealHunter4U</h1>
      <p style={{ color: '#666', fontSize: 18, marginBottom: 40 }}>
        Wij helpen Nederlandse gezinnen elke week slimmer boodschappen te doen.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Onze missie</h2>
        <p style={{ marginBottom: 16 }}>
          DealHunter4U is opgericht met één duidelijk doel: het voor iedereen makkelijker maken om te besparen op dagelijkse boodschappen. In een tijd waarin de prijzen in de supermarkt flink zijn gestegen, willen wij ervoor zorgen dat u altijd de beste aanbiedingen vindt — zonder urenlang folders te hoeven doorbladeren.
        </p>
        <p style={{ marginBottom: 16 }}>
          Wij geloven dat geld besparen op boodschappen niet moeilijk hoeft te zijn. Met de juiste informatie op het juiste moment kunt u gemakkelijk €50 tot €100 per maand besparen, gewoon door slim te kiezen welke producten u waar koopt.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Wat doen wij?</h2>
        <p style={{ marginBottom: 16 }}>
          Elke week verzamelen wij automatisch de actuele aanbiedingen van de grootste Nederlandse supermarkten: Albert Heijn, Jumbo, Lidl, Aldi, Dirk, Plus, DekaMarkt, Hoogvliet, Kruidvat en meer. Alle aanbiedingen worden op één overzichtelijke pagina getoond, zodat u in één oogopslag ziet waar de beste deals zijn.
        </p>
        <p style={{ marginBottom: 16 }}>
          Onze technologie werkt 24 uur per dag, 7 dagen per week. Zodra supermarkten nieuwe aanbiedingen publiceren, verschijnen deze automatisch op onze website. U hoeft nooit meer zelf folders te vergelijken of van supermarkt naar supermarkt te surfen.
        </p>
        <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
          <li style={{ marginBottom: 8 }}><strong>Actuele aanbiedingen</strong> — Automatisch bijgewerkt van alle grote supermarkten</li>
          <li style={{ marginBottom: 8 }}><strong>Slimme filters</strong> — Filter op supermarkt, categorie of type aanbieding</li>
          <li style={{ marginBottom: 8 }}><strong>Prijsvergelijking</strong> — Zie direct waar een product het goedkoopst is</li>
          <li style={{ marginBottom: 8 }}><strong>Meldingen</strong> — Ontvang een melding als uw favoriete product in de aanbieding is</li>
          <li style={{ marginBottom: 8 }}><strong>Boodschappenlijst</strong> — Maak een persoonlijke lijst van favoriete aanbiedingen</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Voor wie is DealHunter4U?</h2>
        <p style={{ marginBottom: 16 }}>
          DealHunter4U is voor iedereen die slim met geld omgaat. Of u nu een druk gezin heeft met veel monden te voeden, student bent met een beperkt budget, of gewoon niet onnodig wilt betalen — onze website helpt u elke week een betere keuze te maken.
        </p>
        <p style={{ marginBottom: 16 }}>
          Uit onderzoek blijkt dat Nederlandse huishoudens gemiddeld €3.500 per jaar uitgeven aan boodschappen. Door slim gebruik te maken van supermarktaanbiedingen kunt u hier eenvoudig 10 tot 20 procent op besparen. Dat is €350 tot €700 per jaar — geld dat u voor andere dingen kunt gebruiken.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Onze aanpak</h2>
        <p style={{ marginBottom: 16 }}>
          Wij werken volledig onafhankelijk. Onze aanbiedingen worden automatisch verzameld van de officiële websites van de supermarkten. Wij hebben geen commerciële relatie met de supermarkten zelf en geven geen voorkeur aan een bepaalde keten. Ons doel is altijd om u de meest volledige en eerlijke informatie te geven.
        </p>
        <p style={{ marginBottom: 16 }}>
          Naast de aanbiedingsoverzichten schrijven wij ook regelmatig artikelen over slim boodschappen doen, prijsvergelijkingen en tips om uw maandelijkse boodschappenbudget te verlagen. Deze artikelen zijn gebaseerd op eigen onderzoek en zijn bedoeld om u praktisch te helpen.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Transparantie</h2>
        <p style={{ marginBottom: 16 }}>
          DealHunter4U is gratis te gebruiken. Wij verdienen aan affiliate commissies wanneer u via onze website een product koopt bij een van onze partners. Dit heeft geen invloed op de aanbiedingen die wij tonen — wij laten altijd alle aanbiedingen zien, ook van supermarkten waarmee wij geen affiliate relatie hebben.
        </p>
        <p style={{ marginBottom: 16 }}>
          Wij werken samen met affiliate netwerken zoals Daisycon en Awin. Op sommige pagina&apos;s staan gesponsorde links die duidelijk zijn gemarkeerd. Onze redactionele inhoud en aanbiedingsoverzichten zijn altijd onafhankelijk.
        </p>
      </section>

      <section style={{ background: '#FFF8F6', border: '2px solid #F5E6C8', borderRadius: 16, padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Contact</h2>
        <p style={{ marginBottom: 12 }}>
          Heeft u vragen, opmerkingen of suggesties? Wij horen het graag.
        </p>
        <p>
          E-mail: <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26', fontWeight: 600 }}>info@dealhunter4u.nl</a>
          {' '}&nbsp;|&nbsp;{' '}
          <Link href="/contact" style={{ color: '#E33D26', fontWeight: 600 }}>Contactpagina</Link>
        </p>
      </section>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/blog" style={{ background: '#E33D26', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
          Lees onze artikelen
        </Link>
        <Link href="/" style={{ background: '#1A1A1A', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
          Bekijk aanbiedingen
        </Link>
      </div>
    </div>
  )
}
