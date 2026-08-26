'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackAffiliateClick, trackMeerBesparenOpen } from '@/lib/analytics'
import { getMarketDestination } from '@/lib/affiliate'

// M: haal de URL uit AFFILIATE_MAP (lib/affiliate.ts) i.p.v. hem hier nog een keer
// op te schrijven. Dit was een echte bugbron: dezelfde merchant stond op twee
// plekken en die liepen uit elkaar zonder dat iets het merkte —
//   • Holland & Barrett: hier /shop/aanbiedingen/ (goed), in de map /aanbiedingen (404)
//   • BioProphyl:        beide .com, met een kapot certificaat
//   • Bol.com:           hier /nl/nl/, in de map / (extra redirect)
// Alle 56 merchants die in béide lijsten stonden zijn nu naar M() omgezet; op het
// moment van omzetten leverden beide bronnen exact dezelfde URL op (gecontroleerd
// per merchant), dus dit verandert geen enkele link — het maakt alleen een
// toekomstige divergentie onmogelijk.
//
// Bewust hard falen bij een onbekende naam: een typefout of een verwijderde
// map-entry breekt dan de build i.p.v. stilletjes een dode link op te leveren.
// De overige 63 merchants staan alleen hier (niet in de map) en houden hun
// eigen AW()/DS()/DC()-URL — die kunnen per definitie niet divergeren.
const M = (name: string): string => {
  const url = getMarketDestination(name)
  if (!url) throw new Error(`MeerBesparenWidget: '${name}' ontbreekt in AFFILIATE_MAP`)
  return url
}

const AW = (mid: number, dest: string) =>
  `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=2932569&ued=${encodeURIComponent(dest)}`

// DS: legacy format (si=publisher media ID) — only for programs verified to work with this format
const DS = (si: string, li: string, dl: string) =>
  `https://ds1.nl/c/?si=${si}&li=${li}&wi=420902&dl=${encodeURIComponent(dl)}`

// DC: correct CSV format — si=program ID, li=per-publisher link ID, domain per program
const DC = (base: string, dest: string) =>
  `${base}&dl=${encodeURIComponent(dest)}`

// Tijdelijke bonusacties. Elke actie draagt verplicht een einddatum: zonder die
// datum blijft een afgelopen aanbieding als harde claim op de site staan, en dat
// is precies het soort belofte dat niemand op tijd weghaalt. Na `totEnMet`
// verdwijnt de badge vanzelf — de regel hieronder mag dan blijven staan.
//
// ENGIE draait deze "WATT een VOORDEEL"-dagen periodiek (6 en 8 juli, 17-21 aug),
// dus deze tabel wordt vaker gebruikt dan het nu lijkt.
const PROMOS: Record<string, { tekst: string; totEnMet: string }> = {
  // Daisycon-notificatie 2026-08-19: "t/m vrijdag ... bonus die kan oplopen tot
  // wel € 750 bij een 3 jaar contract". Bewust "tot" — de volle € 750 geldt
  // alleen bij 3 jaar, dus een kalere "€ 750 bonus" zou misleidend zijn.
  ENGIE: { tekst: '⚡ Tot € 750 bonus', totEnMet: '2026-08-21' },
}

function actievePromo(naam: string) {
  const promo = PROMOS[naam]
  if (!promo) return undefined
  const vandaag = new Date().toISOString().slice(0, 10)
  return vandaag <= promo.totEnMet ? promo : undefined
}

const DEALS = [
  {
    id: 'energie',
    category: '⚡ Energie',
    items: [
      // dl= parameter breekt bij deze 3 (dubbele URL → 404/foutpagina, canlı test 2026-07-06) — geen dl
      { name: 'ENGIE',        tagline: 'Gas & stroom vergelijken', cta: 'Vergelijk tarief', color: '#0064A8', url: M('ENGIE') },
      { name: 'Oxxio',        tagline: 'Vaste lage tarieven',      cta: 'Vergelijk tarief', color: '#E4002B', url: M('Oxxio') },
      { name: 'Pure Energie', tagline: 'Goedkoop & transparant',   cta: 'Vergelijk tarief', color: '#F7941D', url: M('Pure Energie') },
      { name: 'noSun',   tagline: 'Zonnepanelen voor thuis',      cta: 'Bekijk aanbod', color: '#F59B00', url: M('noSun') },
      { name: 'Renogy', tagline: 'Zonnepanelen & accu\'s voor thuis', cta: 'Bekijk aanbod', color: '#E87722', url: M('Renogy') },
      // 2026-07-02/05 onaylı, trackingBase 2026-07-06 CSV export'undan doğrulandı
      { name: 'Essent',           tagline: 'Grootste energieleverancier van NL', cta: 'Vergelijk tarief', color: '#E2001A', url: M('Essent') },
      { name: 'energiedirect',    tagline: 'Gas & stroom voordelig geregeld',    cta: 'Vergelijk tarief', color: '#0F9D58', url: M('energiedirect') },
      { name: 'Frank Energie',    tagline: 'Dynamische energietarieven',        cta: 'Vergelijk tarief', color: '#1A1A2E', url: M('Frank Energie') },
      { name: 'Gewoon Energie',   tagline: 'Eerlijke energie zonder poespas',   cta: 'Vergelijk tarief', color: '#00A99D', url: M('Gewoon Energie') },
      { name: 'Powerpeers',       tagline: 'Deel lokale groene stroom',         cta: 'Bekijk aanbod',    color: '#6FCF97', url: M('Powerpeers') },
      // 2026-07-12 onaylı
      { name: 'Vandebron',        tagline: 'Groene stroom van eigen bodem',     cta: 'Vergelijk tarief', color: '#00A651', url: M('Vandebron') },
      // 2026-08-19 toegevoegd: de twee grootste NL-leveranciers ontbraken nog
      { name: 'Eneco',            tagline: 'Grote leverancier, groene stroom',  cta: 'Vergelijk tarief', color: '#E6007E', url: M('Eneco') },
      { name: 'Vattenfall',       tagline: 'Stroom & gas, vaste of variabele',  cta: 'Vergelijk tarief', color: '#FFDA00', url: M('Vattenfall') },
    ],
  },
  {
    id: 'telecom',
    category: '📱 Telecom',
    items: [
      { name: 'Ziggo',          tagline: 'Internet, TV & bellen',    cta: 'Bekijk abonnement', color: '#FF6600', url: M('Ziggo') },
      // Goedgekeurd maar nooit aangesloten; li bevestigd via export 2026-07-26 (€50/sale, 100g)
      { name: 'MeerMetZiggo',   tagline: 'Ziggo internet & TV-deal', cta: 'Bekijk deal',       color: '#E87722', url: M('MeerMetZiggo') },
      { name: 'hollandsnieuwe', tagline: 'Voordelig mobiel internet', cta: 'Bekijk abonnement', color: '#00A650', url: M('hollandsnieuwe') },
      { name: 'Lycamobile',     tagline: 'Goedkoop SIM-only',        cta: 'Bekijk abonnement', color: '#E4002B', url: DC('https://bdt9.net/c/?si=19078&li=1819944&wi=420902',  'https://www.lycamobile.nl/nl/') },
      { name: 'Company Telecom', tagline: 'Voordelig bellen & internet', cta: 'Bekijk aanbod',    color: '#0073E6', url: 'https://glp8.net/c/?si=20673&li=1876628&wi=420902' },
      // 2026-07-16 onaylı — TradeTracker (Daisycon/Awin değil), site ID 511755
      { name: 'B2Ctelecom.nl', tagline: 'Mobiel & internet vergelijken', cta: 'Vergelijk aanbod', color: '#1D3557', url: 'https://partner.b2ctelecom.nl/c?c=4714&m=12&a=511755&r=&u=%2F' },
      // 2026-08-19: marktleider ontbrak
      { name: 'KPN',           tagline: 'Internet, TV & mobiel',        cta: 'Bekijk aanbod',    color: '#00C300', url: M('KPN') },
      // 2026-07-22 onaylı — li bevestigd via Daisycon 2026-07-24 campaigns export, tracking actief
      { name: 'Canal+',        tagline: 'Films, series & sport streamen', cta: 'Bekijk abonnement', color: '#000000', url: M('Canal+') },
    ],
  },
  {
    id: 'verzekering',
    category: '🏥 Verzekering',
    items: [
      // dl= parameter breekt bij deze 4 (dubbele URL → 404/foutpagina, canlı test 2026-07-06) — geen dl
      { name: 'ONVZ',                  tagline: 'Zorgverzekering vergelijken', cta: 'Bereken premie', color: '#E4002B', url: 'https://ds1.nl/c/?si=16070&li=1332385&wi=420902' },
      { name: 'Nationale-Nederlanden', tagline: 'Zorg & aanvullend pakket',    cta: 'Bereken premie', color: '#FF6200', url: 'https://ds1.nl/c/?si=16070&li=1362622&wi=420902' },
      { name: 'DELA',                  tagline: 'Uitvaartverzekering',         cta: 'Bekijk aanbod',  color: '#003087', url: 'https://ds1.nl/c/?si=16070&li=1414707&wi=420902' },
      { name: 'Monuta',                tagline: 'Uitvaartzorg geregeld',       cta: 'Bekijk aanbod',  color: '#2C5F8A', url: 'https://ds1.nl/c/?si=16070&li=1414357&wi=420902' },
      // Deeplink desteklemiyor (Advertisements > Landing Page reklam materyali) — dl= eklenmez, DC() kullanılmaz
      { name: 'Housefinan',            tagline: 'Hypotheek vergelijken (DE)',  cta: 'Vergelijk rente', color: '#0A5C36', url: 'https://glp8.net/c/?si=21988&li=1926905&wi=420902' },
      { name: 'Kredanta',              tagline: 'Krediet vergelijken (DACH)',  cta: 'Vergelijk krediet', color: '#1A3E6F', url: 'https://glp8.net/c/?si=21987&li=1926881&wi=420902' },
      { name: 'JW Verzekeringen',      tagline: 'Autoverzekering vergelijken', cta: 'Bereken premie', color: '#B71C1C', url: 'https://partners.jwverzekeringen.nl/c/?si=21167&li=1901301&wi=420902' },
    ],
  },
  {
    id: 'reizen',
    category: '✈️ Reizen',
    items: [
      { name: 'CheapTickets',             tagline: 'Goedkope vluchten',             cta: 'Zoek vlucht',    color: '#D9251D', url: DS('16070', '70202',   'https://www.cheaptickets.nl/vluchten') },
      // dl= parameter breekt (dubbele URL, canlı test 2026-07-06) — geen dl
      { name: 'Vakantiediscounter',       tagline: 'Last minute vakanties',         cta: 'Bekijk deals',   color: '#006FB9', url: 'https://ds1.nl/c/?si=16070&li=1362777&wi=420902' },
      { name: 'Prijsvrij',               tagline: 'Vluchten & hotels',             cta: 'Zoek vakantie',  color: '#FF6B00', url: DS('16070', '168050',  'https://www.prijsvrij.nl/last-minute') },
      { name: 'Oad',                     tagline: 'Georganiseerde reizen',         cta: 'Bekijk reizen',  color: '#003B7A', url: DS('16070', '1352504', 'https://www.oad.nl/aanbiedingen') },
      { name: 'Tjingo',                  tagline: 'Vliegvakanties & last minute',  cta: 'Zoek vakantie',  color: '#E8341C', url: 'https://ds1.nl/c/?si=2554&li=148518&wi=420902' },
      { name: 'Tiara Tours',             tagline: 'Reizen op maat',                cta: 'Bekijk reizen',  color: '#1A6B8A', url: 'https://jf79.net/c/?si=17054&li=1736409&wi=420902' },
      { name: 'ViaLuxury',               tagline: 'Luxe hotels & villa\'s',        cta: 'Bekijk aanbod',  color: '#C9A84C', url: 'https://bdt9.net/c/?si=19222&li=1824730&wi=420902' },
      { name: 'Bebsy',                   tagline: 'Weekendjes weg in NL',          cta: 'Bekijk deals',   color: '#E84393', url: 'https://ds1.nl/c/?si=7887&li=1366579&wi=420902' },
      { name: 'Campings.com',            tagline: 'Campings & bungalows boeken',   cta: 'Zoek camping',   color: '#3A8C3F', url: 'https://jf79.net/c/?si=16264&li=1698129&wi=420902' },
      { name: 'Landgoed Ruwinkel',       tagline: 'Verblijf in de natuur',         cta: 'Bekijk verblijf', color: '#5C7A3E', url: 'https://ds1.nl/c/?si=8921&li=1410027&wi=420902' },
      { name: 'Thermae 2000',            tagline: 'Wellness & thermaalbadenpark',  cta: 'Bekijk aanbod',  color: '#7B9DC4', url: 'https://lt45.net/c/?si=11710&li=1519100&wi=420902' },
      { name: '123Helikoptervluchten',   tagline: 'Helikoptervlucht cadeau',       cta: 'Bekijk vluchten', color: '#F59E0B', url: 'https://jdt8.net/c/?si=17893&li=1774970&wi=420902' },
      // 2026-08-19: smartbox.com/nl-nl/, /nl/ en /nl-be/ geven allemaal 503 — de NL-site is
      // naar bongo.nl verhuisd (smartbox.com linkt er zelf naartoe). dl=bongo.nl is
      // getest en wordt door het programma NIET geaccepteerd: het dwingt de bestemming
      // terug naar smartbox.com en dat pad geeft weer 503. Daarom dl= helemaal weggelaten;
      // de kale trackinglink landt op smartbox.com zelf (200, wel de corporate pagina).
      // Zelfde patroon als de 3 energie-merchants hierboven waar dl= ook brak.
      { name: 'Smartbox & Bongo',        tagline: 'Cadeaubon voor beleving',       cta: 'Bekijk aanbod',  color: '#C8102E', url: 'https://glp8.net/c/?si=21185&li=1902306&wi=420902' },
      { name: 'Leukstetickets',          tagline: 'Uitjes, events & shows',        cta: 'Bekijk tickets', color: '#FF4500', url: M('Leukstetickets') },
      { name: 'UplandParcs',             tagline: 'Luxe vakantieverblijven DE/AT', cta: 'Bekijk verblijven', color: '#6D4C41', url: 'https://fr135.net/c/?si=15690&li=1680158&wi=420902' },
      { name: 'Lavida Travel',           tagline: 'Vakanties & tours online',      cta: 'Bekijk reizen',  color: '#00796B', url: 'https://ds1.nl/c/?si=6141&li=1285507&wi=420902' },
      { name: 'Italieplanner',           tagline: 'Persoonlijke reizen door Italië', cta: 'Plan reis',    color: '#C62828', url: 'https://ds1.nl/c/?si=19421&li=1830808&wi=420902' },
      { name: 'Wereldplanner',           tagline: 'Reizen naar elke bestemming',   cta: 'Bekijk reizen',  color: '#1565C0', url: 'https://ds1.nl/c/?si=20232&li=1862768&wi=420902' },
      { name: 'Doenkado',                tagline: 'Uitjes & belevenissen cadeau',  cta: 'Bekijk ervaringen', color: '#E65100', url: 'https://ds1.nl/c/?si=1305&li=80616&wi=420902' },
      { name: 'Kiwi.com',                tagline: 'Goedkoopste vluchten EU',       cta: 'Zoek vlucht',    color: '#F57F17', url: DC('https://glp8.net/c/?si=20714&li=1878051&wi=420902',   'https://www.kiwi.com/nl/') },
      // 2026-07-07 onaylı — li bevestigd via Daisycon 2026-07-16 campaigns export, tracking actief
      { name: 'Sembo',                   tagline: 'Pakketreizen & vliegvakanties', cta: 'Bekijk reizen',  color: '#0057B8', url: M('Sembo') },
    ],
  },
  {
    id: 'wonen',
    category: '🏠 Thuis & Wonen',
    items: [
      // eski /nl/l/topdeals/ hedefi bol.com'da 404 oldu (2026-07-13) — ana sayfa
      { name: 'Bol.com',          tagline: 'Dagelijks nieuwe topdeals',    cta: 'Bekijk deals',    color: '#0000A4', url: M('Bol.com') },
      // Kwantum's eigen redirect breekt op de dl= deeplink parameter (dubbele URL → 404,
      // zelfde probleem als Levi's/Rakuten) — geen dl, gaat naar kwantum.nl homepage i.p.v. /sale
      { name: 'Kwantum',          tagline: 'Gordijnen, vloeren & meer',    cta: 'Bekijk sale',     color: '#E2001A', url: 'https://ds1.nl/c/?si=16070&li=1360074&wi=420902' },
      // Goedgekeurd maar nooit aangesloten; li bevestigd via export 2026-07-26 (€50/sale, 100g)
      { name: 'I-KOOK',           tagline: 'Keukens op maat',              cta: 'Bekijk keukens',  color: '#C8102E', url: M('I-KOOK') },
      // 2026-07-07 onaylı — li bevestigd via Daisycon 2026-07-16 campaigns export, tracking actief
      { name: 'Westwing',         tagline: 'Design meubels & woonaccessoires', cta: 'Bekijk aanbod', color: '#8B2439', url: M('Westwing') },
      // dl= parameter breekt (dubbele URL, canlı test 2026-07-06) — geen dl
      { name: 'Witgoedhuis',      tagline: 'Witgoed & huishoudapparaten',  cta: 'Bekijk aanbod',   color: '#005BAC', url: 'https://ds1.nl/c/?si=16070&li=1307850&wi=420902' },
      { name: '999Games',         tagline: 'Spellen, puzzels & speelgoed', cta: 'Bekijk aanbod',   color: '#E4007C', url: 'https://lt45.net/c/?si=13450&li=1593002&wi=420902' },
      { name: 'Tuinmeubelwereld', tagline: 'Tuinmeubelen & lounge sets',   cta: 'Bekijk collectie', color: '#3A7D44', url: 'https://bdt9.net/c/?si=19167&li=1822967&wi=420902' },
      { name: 'Miss Towels',      tagline: 'Premium handdoeken & badgoed', cta: 'Bekijk aanbod',   color: '#B5838D', url: 'https://glp8.net/c/?si=21226&li=1904846&wi=420902' },
      { name: 'Florafy',          tagline: 'Bloemen & planten bezorgen',   cta: 'Bestel bloemen',  color: '#FF69B4', url: 'https://d.florafy.eu/c/?si=21211&li=1903580&wi=420902' },
      { name: 'Petgamma',          tagline: 'Dierenbenodigdheden & voer',   cta: 'Bekijk aanbod',    color: '#E67E22', url: M('Petgamma') },
      // 2026-07-20 onaylı — li bevestigd via Daisycon 2026-07-24 campaigns export, tracking actief
      { name: 'Huisdierenbazaar',  tagline: 'Diervoeding & accessoires',    cta: 'Bekijk aanbod',    color: '#F4511E', url: M('Huisdierenbazaar') },
      { name: 'Yuplay',            tagline: 'PC games & game codes',       cta: 'Bekijk games',     color: '#7B2D8B', url: 'https://glp8.net/c/?si=19969&li=1857304&wi=420902' },
      { name: 'Verfuitverkoop.nl', tagline: 'Verfproducten met korting',    cta: 'Bekijk aanbod',    color: '#E65100', url: M('Verfuitverkoop.nl') },
      { name: 'Wixx Coatings',     tagline: 'Professionele verfcoatings',   cta: 'Bekijk aanbod',    color: '#546E7A', url: M('Wixx Coatings') },
      { name: 'HomeWizard',        tagline: 'Slimme energie- & thuismeters', cta: 'Bekijk aanbod',   color: '#1E88E5', url: 'https://partner.homewizard.com/c/?si=18407&li=1795784&wi=420902' },
      { name: 'OfficeCity NL',     tagline: 'Kantoormeubelen & supplies',   cta: 'Bekijk aanbod',    color: '#1565C0', url: M('OfficeCity NL') },
      { name: '8Wines',            tagline: 'Premium wijnen wereldwijd',    cta: 'Bekijk wijnen',    color: '#7B1FA2', url: 'https://glp8.net/c/?si=19317&li=1828446&wi=420902' },
      { name: 'NSA Alarmering',    tagline: 'Persoonlijk alarm voor senioren', cta: 'Bekijk aanbod', color: '#0277BD', url: 'https://jdt8.net/c/?si=17851&li=1773171&wi=420902' },
      { name: 'buttinette NL',     tagline: 'Knutselen & handwerk',         cta: 'Bekijk aanbod',    color: '#C2185B', url: M('buttinette NL') },
      { name: 'Hermie',            tagline: 'Huis, tuin & dierenbenodigdheden', cta: 'Bekijk aanbod', color: '#4E7C31', url: M('Hermie') },
      { name: 'VVVCadeaukaarten.nl', tagline: 'Cadeaukaarten voor elke gelegenheid', cta: 'Bekijk aanbod', color: '#F4B400', url: M('VVVCadeaukaarten.nl') },
      // 2026-07-12/13 onaylı
      { name: 'Beddengoeddirect.nl', tagline: 'Bedden, matrassen & beddengoed', cta: 'Bekijk aanbod', color: '#3E5C76', url: M('Beddengoeddirect.nl') },
      // dl= breekt (dubbele URL → 404, canlı test 2026-07-13) — geen dl
      { name: 'Degrootmeesters',     tagline: 'Kunst & canvas voor aan de muur', cta: 'Bekijk collectie', color: '#5D4037', url: M('Degrootmeesters') },
      { name: 'Kameo Sleep',       tagline: 'Slaapkamer & matrassen',        cta: 'Bekijk aanbod', color: '#264653', url: 'https://glp8.net/c/?si=21324&li=1907610&wi=420902' },
      { name: 'LEDshop Groenovatie', tagline: 'LED-verlichting voor binnen & buiten', cta: 'Bekijk aanbod', color: '#F4A300', url: M('LEDshop Groenovatie') },
      // 2026-07-15 onaylı — li bevestigd via Daisycon 2026-07-16 campaigns export, tracking actief
      { name: 'Foodello',            tagline: 'Boodschappen tot 80% korting',  cta: 'Bekijk aanbod', color: '#4CAF50', url: M('Foodello') },
      // 2026-07-27 onaylı — mid via Awin panel (Advertisers > Joined)
      { name: 'ALLPOWERS',           tagline: 'Powerstations & zonnepanelen',  cta: 'Bekijk aanbod', color: '#FF6B00', url: AW(125964, 'https://iallpowers.nl/') },
    ],
  },
  {
    id: 'mode',
    category: '👟 Sport & Mode',
    items: [
      // 2026-07-27 onaylı — mid via Awin panel (Advertisers > Joined)
      { name: 'Deporvillage',        tagline: 'Fietsen, hardlopen & outdoor gear', cta: 'Bekijk aanbod', color: '#E30613', url: AW(121218, 'https://www.deporvillage.nl/') },
      { name: 'Holland & Barrett', tagline: 'Vitamines, sport & health',  cta: 'Bekijk aanbod',    color: '#007A3D', url: M('Holland & Barrett') },
      { name: 'Vitaepro NL',       tagline: 'Vitamines & gezondheid NL',  cta: 'Bekijk aanbod',    color: '#B71C1C', url: M('Vitaepro NL') },
      { name: 'Direct Running',    tagline: 'Hardloopschoenen & kleding', cta: 'Bekijk aanbod',    color: '#E63329', url: M('Direct Running') },
      { name: 'Direct Volley',     tagline: 'Volleybal gear & kleding',   cta: 'Bekijk aanbod',    color: '#F4A300', url: M('Direct Volley') },
      // dl= parameter breekt (dubbele URL, canlı test 2026-07-06) — geen dl
      { name: 'Sinner',            tagline: 'Sport & outdoorkleding',     cta: 'Bekijk collectie', color: '#D40000', url: 'https://ds1.nl/c/?si=16070&li=79935&wi=420902' },
      { name: 'Vitaminstore',      tagline: 'Vitamines & supplementen',   cta: 'Bekijk aanbod',    color: '#00A651', url: 'https://ds1.nl/c/?si=16070&li=1266442&wi=420902' },
      // .com had een kapot certificaat (*.your-server.de) → beveiligingswaarschuwing
      // i.p.v. de winkel. .be is de landingspagina die Awin zelf voor dit programma
      // registreert, met geldig cert en Nederlandstalig. Zie lib/affiliate.ts.
      { name: 'BioProphyl',        tagline: 'Kwalitatieve supplementen',  cta: 'Bekijk aanbod',    color: '#2E7D32', url: M('BioProphyl') },
      { name: 'Happy Mammoth',     tagline: 'Gut health & supplementen',  cta: 'Bekijk aanbod',    color: '#FF6B35', url: 'https://glp8.net/c/?si=19600&li=1839644&wi=420902' },
      { name: 'Plein.nl',          tagline: 'Drogist & gezondheid online', cta: 'Bekijk aanbod',   color: '#0071BC', url: M('Plein.nl') },
      { name: "Levi's",            tagline: 'Jeans & kleding sale',       cta: 'Shop collectie',   color: '#C8102E', url: 'https://glp8.net/c/?si=19949&li=1850890&wi=420902' },
      { name: 'Weightworld.nl',    tagline: 'Sportvoeding & gewichten',   cta: 'Bekijk aanbod',    color: '#E53935', url: M('Weightworld.nl') },
      { name: 'Oakley',            tagline: 'Sport brillen & kleding',    cta: 'Bekijk collectie', color: '#1A1A1A', url: M('Oakley') },
      { name: 'Wolfswinkel NL',    tagline: 'Outdoor gear & sportmode',   cta: 'Bekijk aanbod',    color: '#388E3C', url: M('Wolfswinkel NL') },
      { name: '123watches',        tagline: 'Horloges & accessoires',     cta: 'Bekijk collectie', color: '#C62828', url: M('123watches') },
      { name: 'Erverte Paris',     tagline: 'Duurzame heren mode uit Parijs', cta: 'Bekijk collectie', color: '#2F4F3E', url: M('Erverte Paris') },
      { name: 'Tsar Bomba',      tagline: 'Horloges & premium accessoires', cta: 'Bekijk collectie', color: '#8B0000', url: 'https://glp8.net/c/?si=21716&li=1916762&wi=420902' },
      { name: 'Sportiek.com',    tagline: 'Sportschoenen & kleding',       cta: 'Bekijk aanbod',    color: '#F97316', url: 'https://ds1.nl/c/?si=8485&li=1389201&wi=420902' },
      { name: 'Primal Focus EU', tagline: 'Focus & energie supplementen',  cta: 'Bekijk aanbod',    color: '#0F766E', url: 'https://glp8.net/c/?si=21577&li=1913855&wi=420902' },
      { name: 'Pulsetto',        tagline: 'Vagus zenuw stimulator & stress', cta: 'Bekijk aanbod',  color: '#6366F1', url: M('Pulsetto') },
      // dl= parameter breekt (dubbele URL → 404, canlı test 2026-08-26) — geen dl,
      // gaat naar drmartens.com homepage i.p.v. /nl/nl/ (zelfde patroon als Kwantum/Levi's)
      { name: 'Dr. Martens',     tagline: 'Iconische boots & schoenen',    cta: 'Bekijk collectie', color: '#FFC72C', url: 'https://fr135.net/c/?si=15138&li=1656908&wi=420902' },
      // Eastpak.com blokt curl/headless (403) zowel mét als zonder dl= — geen dubbele-URL
      // bug zoals Dr. Martens/Foreo, waarschijnlijk gewoon bot-detectie. Niet gewijzigd,
      // canlı browser'da handmatig geverifieerd worden gerekiyor (2026-08-26, browser MCP
      // oturum sırasında koptu, doğrulanamadı).
      { name: 'Eastpak',         tagline: 'Rugzakken & tassen sale',       cta: 'Bekijk collectie', color: '#FF6B00', url: DC('https://glp8.net/c/?si=20076&li=1857675&wi=420902',  'https://www.eastpak.com/nl-nl/') },
      // dl= parameter breekt (dubbele URL → 503, canlı test 2026-08-26) — geen dl,
      // gaat naar foreo.com homepage i.p.v. /nl (zelfde patroon als Dr. Martens hierboven)
      { name: 'Foreo',           tagline: 'Gezichtsreiniging & beauty tech', cta: 'Bekijk aanbod',  color: '#00BCD4', url: 'https://jf79.net/c/?si=16254&li=1697784&wi=420902' },
      // 2026-07-12 onaylı
      { name: 'Sif Jakobs',      tagline: 'Sieraden uit Denemarken',       cta: 'Bekijk collectie', color: '#B08D57', url: M('Sif Jakobs') },
      { name: 'Freewear.nl',     tagline: 'Kleding & accessoires',         cta: 'Shop collectie',   color: '#2D2D2D', url: M('Freewear.nl') },
      // 2026-07-13 onaylı
      // dl= breekt (dubbele URL → 404, canlı test 2026-07-13) — geen dl
      { name: 'Zwemshop.com',    tagline: 'Zwemkleding & accessoires',     cta: 'Bekijk aanbod',    color: '#0077C8', url: M('Zwemshop.com') },
      { name: 'Sneakids',        tagline: 'Kindersneakers & schoenen',     cta: 'Bekijk collectie', color: '#FF6B35', url: AW(103061, 'https://sneakids.nl/') },
      // 2026-07-20 onaylı — li bevestigd via Daisycon 2026-07-24 campaigns export, tracking actief
      { name: 'De Goedkoopste Outlet', tagline: 'Sport- & modeoutlet met korting', cta: 'Bekijk aanbod', color: '#D9251D', url: M('De Goedkoopste Outlet') },
    ],
  },
  {
    id: 'auto',
    category: '🚗 Auto Lease',
    items: [
      { name: 'XLLease',    tagline: 'Private lease deals',       cta: 'Bekijk aanbod',  color: '#003366', url: M('XLLease') },
      { name: 'DutchLease', tagline: 'Elektrisch & hybrid lease', cta: 'Bekijk aanbod',  color: '#009FE3', url: M('DutchLease') },
      { name: 'XLEasy',     tagline: 'Private lease vanaf €299',  cta: 'Bereken prijs',  color: '#1A237E', url: M('XLEasy') },
      // Onderstaande vier: al goedgekeurd maar nooit aangesloten. li's bevestigd
      // via Daisycon-export 2026-07-26. Hoogste vaste vergoedingen in het account.
      { name: 'Lease.auto',      tagline: 'Private lease vergelijken',   cta: 'Vergelijk lease', color: '#E30613', url: M('Lease.auto') },
      { name: 'Wittebrug Lease', tagline: 'Zakelijk & privé lease',      cta: 'Bekijk aanbod',   color: '#0B4EA2', url: M('Wittebrug Lease') },
      { name: 'Carvendo',        tagline: 'Occasions met BOVAG-garantie', cta: 'Bekijk auto\'s',  color: '#00B67A', url: M('Carvendo') },
      { name: 'IkRij.nl',        tagline: 'Private lease zonder gedoe',  cta: 'Bereken prijs',   color: '#F26722', url: M('IkRij.nl') },
    ],
  },
  {
    id: 'tech',
    category: '💻 Tech & Software',
    items: [
      { name: '1blu',        tagline: 'Webhosting & domeinen',        cta: 'Bekijk aanbod', color: '#1A5FA8', url: 'https://glp8.net/c/?si=21031&li=1894705&wi=420902' },
      { name: 'Plaud',       tagline: 'AI-gestuurde voicerecorder',   cta: 'Bekijk aanbod', color: '#2C2C54', url: DC('https://glp8.net/c/?si=21213&li=1903643&wi=420902', 'https://www.plaud.ai/') },
      { name: 'Amazon Music', tagline: 'Muziek streamen zonder limits', cta: 'Probeer gratis', color: '#00A8E1', url: 'https://glp8.net/c/?si=20174&li=1861301&wi=420902' },
      { name: 'Omnisend',        tagline: 'Email & SMS marketing tool',   cta: 'Probeer gratis', color: '#4A90D9', url: 'https://glp8.net/c/?si=20641&li=1874887&wi=420902' },
      { name: 'Quadcopter-shop', tagline: 'Drones voor hobby & pro',      cta: 'Bekijk drones',  color: '#37474F', url: 'https://bdt9.net/c/?si=18088&li=1783485&wi=420902' },
      { name: 'Difmark',         tagline: 'Refurbished smartphones met korting', cta: 'Bekijk aanbod', color: '#059669', url: 'https://glp8.net/c/?si=20242&li=1863153&wi=420902' },
      { name: 'Minisforum FR',   tagline: 'Mini PC\'s & AI workstations',  cta: 'Bekijk aanbod',  color: '#1A1A2E', url: 'https://glp8.net/c/?si=20763&li=1880752&wi=420902' },
      { name: 'Minisforum EU',   tagline: 'Mini PC\'s & AI workstations',  cta: 'Bekijk aanbod',  color: '#2B2D42', url: 'https://glp8.net/c/?si=20771&li=1880782&wi=420902' },
      // 2026-07-20 onaylı (INT) — li bevestigd via Daisycon 2026-07-24 campaigns export, tracking actief
      { name: 'Skikk',           tagline: 'Laptops & computeraccessoires', cta: 'Bekijk aanbod', color: '#1A1A2E', url: M('Skikk') },
    ],
  },
]

const FEATURED_BRANDS = [
  { name: 'Holland & Barrett', category: 'mode',        color: '#007A3D' },
  { name: 'Bol.com',           category: 'wonen',       color: '#0000A4' },
  { name: 'Ziggo',             category: 'telecom',     color: '#FF6600' },
  { name: 'ENGIE',             category: 'energie',     color: '#0064A8' },
  { name: 'CheapTickets',      category: 'reizen',      color: '#D9251D' },
  { name: "Levi's",            category: 'mode',        color: '#C8102E' },
]

// Directe affiliate-URL per featured brand — uit DEALS gehaald (single source of
// truth, geen dubbele URL die uit sync kan raken). undefined = fallback naar drawer.
function findFeaturedUrl(name: string, category: string): string | undefined {
  return DEALS.find(d => d.id === category)?.items.find(i => i.name === name)?.url
}

interface Props {
  open: boolean
  onClose: () => void
  onOpen: (category: string) => void
  activeCategory?: string
}

export function MeerBesparenWidget({ open, onClose, onOpen, activeCategory }: Props) {
  const [tab, setTab] = useState(activeCategory ?? 'energie')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && activeCategory) setTab(activeCategory)
  }, [open, activeCategory])

  // Op de open-flank meten, niet op de triggerknop: zo tellen álle openingen mee
  // (chip, "Meer besparen"-knop, programmatisch) en precies één keer per opening.
  const gemeld = useRef(false)
  useEffect(() => {
    if (!open) { gemeld.current = false; return }
    if (gemeld.current) return
    gemeld.current = true
    trackMeerBesparenOpen(activeCategory ?? tab)
  }, [open, activeCategory, tab])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const activeGroup = DEALS.find(d => d.id === tab) ?? DEALS[0]

  return (
    <>
      {/* BRAND CHIPS — altways visible, direct click to open drawer */}
      <section id="meer-besparen" className="mb-6">
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(227,61,38,0.08) 0%, rgba(227,61,38,0.02) 100%)',
            border: '1.5px solid rgba(227,61,38,0.25)',
            boxShadow: '0 4px 0 #DDD0C4',
          }}
        >
          <span
            className="text-[13px] font-black uppercase tracking-wider whitespace-nowrap flex-none"
            style={{ color: '#E33D26', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            💡 Meer besparen
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {FEATURED_BRANDS.map(b => {
              const url = findFeaturedUrl(b.name, b.category)
              const chipStyle = {
                background: 'white',
                border: `1.5px solid ${b.color}45`,
                color: b.color,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }
              const dot = <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: b.color }} />
              // Directe 1-klik affiliate-link i.p.v. drawer openen — de drawer voor
              // deze 6 merken kostte een extra klik terwijl de link al bekend is.
              // Geen url gevonden (zou niet moeten voorkomen) → val terug op drawer.
              return url ? (
                <a
                  key={b.name}
                  href={url}
                  target="_blank"
                  rel="noopener sponsored"
                  onClick={(e) => {
                    trackAffiliateClick(b.name, b.category, 'featured_chip')
                    window.open(url, '_blank', 'noopener,noreferrer')
                    e.preventDefault()
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-none"
                  style={{ ...chipStyle, textDecoration: 'none' }}
                >
                  {dot}
                  {b.name}
                </a>
              ) : (
                <button
                  key={b.name}
                  onClick={() => onOpen(b.category)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-none"
                  style={chipStyle}
                >
                  {dot}
                  {b.name}
                </button>
              )
            })}
            <button
              onClick={() => onOpen('energie')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-none"
              style={{
                background: 'rgba(26,26,26,0.06)',
                border: '1.5px solid rgba(26,26,26,0.12)',
                color: '#1A1A1A',
              }}
            >
              + Meer
            </button>
          </div>
          <span
            className="text-[10px] font-medium whitespace-nowrap flex-none"
            style={{ color: '#B5AA9C' }}
          >
            Gesponsord
          </span>
        </div>
      </section>

      {/* DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(26,26,26,0.45)', backdropFilter: 'blur(3px)' }}
            />

            {/* Bottom sheet */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 z-[201] flex flex-col"
              style={{
                maxHeight: '82vh',
                background: '#F5EDE3',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-none">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(201,193,182,0.7)' }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 pb-3 pt-1 flex-none"
                style={{ borderBottom: '1px solid rgba(201,193,182,0.35)' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>💡</span>
                  <h2
                    className="text-base font-black uppercase tracking-wide"
                    style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Meer besparen
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                  style={{ background: 'rgba(201,193,182,0.3)', color: '#6B6259' }}
                  aria-label="Sluiten"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Category tabs */}
              <div
                className="flex gap-1 px-4 py-3 overflow-x-auto no-scrollbar flex-none"
                style={{ borderBottom: '1px solid rgba(201,193,182,0.3)' }}
              >
                {DEALS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setTab(d.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-none"
                    style={
                      tab === d.id
                        ? { background: '#1A1A1A', color: 'white' }
                        : { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)', color: '#6B6259' }
                    }
                  >
                    {d.category}
                  </button>
                ))}
              </div>

              {/* Cards */}
              <div
                ref={contentRef}
                className="overflow-y-auto flex-1 p-4"
                style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    {activeGroup.items.map(item => (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={(e) => {
                          e.stopPropagation()
                          trackAffiliateClick(item.name, activeGroup.id, 'drawer')
                          window.open(item.url, '_blank', 'noopener,noreferrer')
                          e.preventDefault()
                        }}
                        className="flex flex-col gap-2 px-4 py-4 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.97]"
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(201,193,182,0.4)',
                          boxShadow: '0 2px 0 #DDD0C4',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          WebkitTapHighlightColor: 'rgba(0,0,0,0.08)',
                        } as React.CSSProperties}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-none"
                            style={{ background: item.color }}
                          />
                          <span className="text-sm font-black truncate" style={{ color: '#1A1A1A' }}>
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#9C9389' }}>
                          {item.tagline}
                        </p>
                        {(() => {
                          const promo = actievePromo(item.name)
                          if (!promo) return null
                          return (
                            <span
                              className="text-[10px] font-black px-2 py-1 rounded-full self-start"
                              style={{ background: `${item.color}1A`, color: item.color }}
                            >
                              {promo.tekst}
                            </span>
                          )
                        })()}
                        <span
                          className="text-[11px] font-bold mt-auto"
                          style={{ color: item.color }}
                        >
                          {item.cta} →
                        </span>
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
