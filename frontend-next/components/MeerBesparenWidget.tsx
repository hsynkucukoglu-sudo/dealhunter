'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AW = (mid: number, dest: string) =>
  `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=2932569&ued=${encodeURIComponent(dest)}`

// DS: legacy format (si=publisher media ID) — only for programs verified to work with this format
const DS = (si: string, li: string, dl: string) =>
  `https://ds1.nl/c/?si=${si}&li=${li}&wi=420902&dl=${encodeURIComponent(dl)}`

// DC: correct CSV format — si=program ID, li=per-publisher link ID, domain per program
const DC = (base: string, dest: string) =>
  `${base}&dl=${encodeURIComponent(dest)}`

const DEALS = [
  {
    id: 'energie',
    category: '⚡ Energie',
    items: [
      { name: 'ENGIE',        tagline: 'Gas & stroom vergelijken', cta: 'Vergelijk tarief', color: '#0064A8', url: DS('16070', '20757',   'https://www.engie.nl/energie-vergelijken') },
      { name: 'Oxxio',        tagline: 'Vaste lage tarieven',      cta: 'Vergelijk tarief', color: '#E4002B', url: DS('16070', '119834',  'https://www.oxxio.nl/energie/alles-in-1') },
      { name: 'Pure Energie', tagline: 'Goedkoop & transparant',   cta: 'Vergelijk tarief', color: '#F7941D', url: DS('16070', '1420973', 'https://www.pure-energie.nl/energie-vergelijken') },
      { name: 'noSun',   tagline: 'Zonnepanelen voor thuis',      cta: 'Bekijk aanbod', color: '#F59B00', url: DC('https://dt51.net/c/?si=19142&li=1877489&wi=420902',  'https://www.nosun.nl/') },
      { name: 'Renogy', tagline: 'Zonnepanelen & accu\'s voor thuis', cta: 'Bekijk aanbod', color: '#E87722', url: DC('https://glp8.net/c/?si=21168&li=1901324&wi=420902', 'https://www.renogy.com/eu/') },
    ],
  },
  {
    id: 'telecom',
    category: '📱 Telecom',
    items: [
      { name: 'Ziggo',          tagline: 'Internet, TV & bellen',    cta: 'Bekijk abonnement', color: '#FF6600', url: DC('https://jf79.net/c/?si=17174&li=1742299&wi=420902',  'https://www.meervoordeel.nl/providers/ziggo/') },
      { name: 'hollandsnieuwe', tagline: 'Voordelig mobiel internet', cta: 'Bekijk abonnement', color: '#00A650', url: DC('https://glp8.net/c/?si=21994&li=1927639&wi=420902',  'https://www.hollandsnieuwe.nl/abonnementen/') },
      { name: 'Lycamobile',     tagline: 'Goedkoop SIM-only',        cta: 'Bekijk abonnement', color: '#E4002B', url: DC('https://bdt9.net/c/?si=19078&li=1819944&wi=420902',  'https://www.lycamobile.nl/nl/') },
      { name: 'Company Telecom', tagline: 'Voordelig bellen & internet', cta: 'Bekijk aanbod',    color: '#0073E6', url: DC('https://glp8.net/c/?si=20673&li=1876628&wi=420902',  'https://www.company.nl/') },
    ],
  },
  {
    id: 'verzekering',
    category: '🏥 Verzekering',
    items: [
      { name: 'ONVZ',                  tagline: 'Zorgverzekering vergelijken', cta: 'Bereken premie', color: '#E4002B', url: DS('16070', '1332385', 'https://www.onvz.nl/zorgverzekering') },
      { name: 'Nationale-Nederlanden', tagline: 'Zorg & aanvullend pakket',    cta: 'Bereken premie', color: '#FF6200', url: DS('16070', '1362622', 'https://www.nn.nl/zorgverzekering/') },
      { name: 'DELA',                  tagline: 'Uitvaartverzekering',         cta: 'Bekijk aanbod',  color: '#003087', url: DS('16070', '1414707', 'https://www.dela.nl/uitvaartverzekering') },
      { name: 'Monuta',                tagline: 'Uitvaartzorg geregeld',       cta: 'Bekijk aanbod',  color: '#2C5F8A', url: DS('16070', '1414357', 'https://www.monuta.nl/uitvaartverzekering') },
    ],
  },
  {
    id: 'reizen',
    category: '✈️ Reizen',
    items: [
      { name: 'CheapTickets',             tagline: 'Goedkope vluchten',             cta: 'Zoek vlucht',    color: '#D9251D', url: DS('16070', '70202',   'https://www.cheaptickets.nl/vluchten') },
      { name: 'Vakantiediscounter',       tagline: 'Last minute vakanties',         cta: 'Bekijk deals',   color: '#006FB9', url: DS('16070', '1362777', 'https://www.vakantiediscounter.nl/last-minute/') },
      { name: 'Prijsvrij',               tagline: 'Vluchten & hotels',             cta: 'Zoek vakantie',  color: '#FF6B00', url: DS('16070', '168050',  'https://www.prijsvrij.nl/last-minute') },
      { name: 'Oad',                     tagline: 'Georganiseerde reizen',         cta: 'Bekijk reizen',  color: '#003B7A', url: DS('16070', '1352504', 'https://www.oad.nl/aanbiedingen') },
      { name: 'Tjingo',                  tagline: 'Vliegvakanties & last minute',  cta: 'Zoek vakantie',  color: '#E8341C', url: DC('https://ds1.nl/c/?si=2554&li=148518&wi=420902',        'https://www.tjingo.nl/') },
      { name: 'Tiara Tours',             tagline: 'Reizen op maat',                cta: 'Bekijk reizen',  color: '#1A6B8A', url: DC('https://jf79.net/c/?si=17054&li=1736409&wi=420902',   'https://www.tiaratours.nl/') },
      { name: 'ViaLuxury',               tagline: 'Luxe hotels & villa\'s',        cta: 'Bekijk aanbod',  color: '#C9A84C', url: DC('https://bdt9.net/c/?si=19222&li=1824730&wi=420902',   'https://vialuxury.com/') },
      { name: 'Bebsy',                   tagline: 'Weekendjes weg in NL',          cta: 'Bekijk deals',   color: '#E84393', url: DC('https://ds1.nl/c/?si=7887&li=1366579&wi=420902',       'https://bebsy.nl/') },
      { name: 'Campings.com',            tagline: 'Campings & bungalows boeken',   cta: 'Zoek camping',   color: '#3A8C3F', url: DC('https://jf79.net/c/?si=16264&li=1698129&wi=420902',   'https://www.campings.com/') },
      { name: 'Landgoed Ruwinkel',       tagline: 'Verblijf in de natuur',         cta: 'Bekijk verblijf', color: '#5C7A3E', url: DC('https://ds1.nl/c/?si=8921&li=1410027&wi=420902',     'https://www.landgoedruwinkel.nl/') },
      { name: 'Thermae 2000',            tagline: 'Wellness & thermaalbadenpark',  cta: 'Bekijk aanbod',  color: '#7B9DC4', url: DC('https://lt45.net/c/?si=11710&li=1519100&wi=420902',   'https://www.thermae.nl/') },
      { name: 'Vipio',                   tagline: 'Unieke ervaringen & uitjes',    cta: 'Bekijk ervaringen', color: '#8B5CF6', url: DC('https://fr135.net/c/?si=15569&li=1672748&wi=420902', 'https://www.vipio.com/') },
      { name: '123Helikoptervluchten',   tagline: 'Helikoptervlucht cadeau',       cta: 'Bekijk vluchten', color: '#F59E0B', url: DC('https://jdt8.net/c/?si=17893&li=1774970&wi=420902',  'https://www.123helikoptervluchten.nl/') },
      { name: 'Smartbox & Bongo',        tagline: 'Cadeaubon voor beleving',       cta: 'Bekijk aanbod',  color: '#C8102E', url: DC('https://glp8.net/c/?si=21185&li=1902306&wi=420902',   'https://www.smartbox.com/nl-nl/') },
      { name: 'Leukstetickets',          tagline: 'Uitjes, events & shows',        cta: 'Bekijk tickets', color: '#FF4500', url: DC('https://lt45.net/c/?si=15805&li=1684191&wi=420902',   'https://www.leukstetickets.nl/') },
      { name: 'UplandParcs',             tagline: 'Luxe vakantieverblijven DE/AT', cta: 'Bekijk verblijven', color: '#6D4C41', url: DC('https://fr135.net/c/?si=15690&li=1680158&wi=420902', 'https://www.uplandparcs.nl/') },
      { name: 'Lavida Travel',           tagline: 'Vakanties & tours online',      cta: 'Bekijk reizen',  color: '#00796B', url: DC('https://ds1.nl/c/?si=6141&li=1285507&wi=420902',      'https://www.lavidatravel.nl/') },
      { name: 'Italieplanner',           tagline: 'Persoonlijke reizen door Italië', cta: 'Plan reis',    color: '#C62828', url: DC('https://ds1.nl/c/?si=19421&li=1830808&wi=420902',     'https://www.italieplanner.nl/') },
      { name: 'Wereldplanner',           tagline: 'Reizen naar elke bestemming',   cta: 'Bekijk reizen',  color: '#1565C0', url: DC('https://ds1.nl/c/?si=20232&li=1862768&wi=420902',     'https://www.wereldplanner.nl/') },
      { name: 'Doenkado',                tagline: 'Uitjes & belevenissen cadeau',  cta: 'Bekijk ervaringen', color: '#E65100', url: DC('https://ds1.nl/c/?si=1305&li=80616&wi=420902',    'https://www.doenkado.nl/') },
      { name: 'Kiwi.com',                tagline: 'Goedkoopste vluchten EU',       cta: 'Zoek vlucht',    color: '#F57F17', url: DC('https://glp8.net/c/?si=20714&li=1878051&wi=420902',   'https://www.kiwi.com/nl/') },
    ],
  },
  {
    id: 'wonen',
    category: '🏠 Thuis & Wonen',
    items: [
      { name: 'Bol.com',          tagline: 'Dagelijks nieuwe topdeals',    cta: 'Bekijk topdeals', color: '#0000A4', url: `https://partner.bol.com/click/click?p=2&t=url&s=1527078&url=${encodeURIComponent('https://www.bol.com/nl/l/topdeals/')}` },
      { name: 'Kwantum',          tagline: 'Gordijnen, vloeren & meer',    cta: 'Bekijk sale',     color: '#E2001A', url: DS('16070', '1360074', 'https://www.kwantum.nl/sale') },
      { name: 'Witgoedhuis',      tagline: 'Witgoed & huishoudapparaten',  cta: 'Bekijk aanbod',   color: '#005BAC', url: DS('16070', '1307850', 'https://www.witgoedhuis.nl/aanbiedingen') },
      { name: '999Games',         tagline: 'Spellen, puzzels & speelgoed', cta: 'Bekijk aanbod',   color: '#E4007C', url: DC('https://lt45.net/c/?si=13450&li=1593002&wi=420902',  'https://www.999games.nl/') },
      { name: 'Tuinmeubelwereld', tagline: 'Tuinmeubelen & lounge sets',   cta: 'Bekijk collectie', color: '#3A7D44', url: DC('https://bdt9.net/c/?si=19167&li=1822967&wi=420902',  'https://www.tuinmeubelwereld.nl/') },
      { name: 'Miss Towels',      tagline: 'Premium handdoeken & badgoed', cta: 'Bekijk aanbod',   color: '#B5838D', url: DC('https://glp8.net/c/?si=21226&li=1904846&wi=420902',  'https://www.misstowels.nl/') },
      { name: 'Florafy',          tagline: 'Bloemen & planten bezorgen',   cta: 'Bestel bloemen',  color: '#FF69B4', url: DC('https://d.florafy.eu/c/?si=21211&li=1903580&wi=420902', 'https://www.florafy.eu/nl/') },
      { name: 'Petgamma',          tagline: 'Dierenbenodigdheden & voer',   cta: 'Bekijk aanbod',    color: '#E67E22', url: DC('https://fr135.net/c/?si=20686&li=1877039&wi=420902',  'https://www.petgamma.com/') },
      { name: 'Yuplay',            tagline: 'PC games & game codes',       cta: 'Bekijk games',     color: '#7B2D8B', url: 'https://glp8.net/c/?si=19969&li=1857304&wi=420902' },
      { name: 'Verfuitverkoop.nl', tagline: 'Verfproducten met korting',    cta: 'Bekijk aanbod',    color: '#E65100', url: DC('https://glp8.net/c/?si=21219&li=1904818&wi=420902',  'https://www.verfuitverkoop.nl/') },
      { name: 'Wixx Coatings',     tagline: 'Professionele verfcoatings',   cta: 'Bekijk aanbod',    color: '#546E7A', url: DC('https://glp8.net/c/?si=21467&li=1913625&wi=420902',  'https://www.wixxcoatings.nl/') },
      { name: 'HomeWizard',        tagline: 'Slimme energie- & thuismeters', cta: 'Bekijk aanbod',   color: '#1E88E5', url: DC('https://partner.homewizard.com/c/?si=18407&li=1795784&wi=420902', 'https://www.homewizard.com/') },
      { name: 'OfficeCity NL',     tagline: 'Kantoormeubelen & supplies',   cta: 'Bekijk aanbod',    color: '#1565C0', url: AW(31671,   'https://www.officecity.nl/') },
      { name: '8Wines',            tagline: 'Premium wijnen wereldwijd',    cta: 'Bekijk wijnen',    color: '#7B1FA2', url: DC('https://glp8.net/c/?si=19317&li=1828446&wi=420902',   'https://www.8wines.com/') },
      { name: 'NSA Alarmering',    tagline: 'Persoonlijk alarm voor senioren', cta: 'Bekijk aanbod', color: '#0277BD', url: DC('https://jdt8.net/c/?si=17851&li=1773171&wi=420902',   'https://nl-alarmering.nl/') },
    ],
  },
  {
    id: 'mode',
    category: '👟 Sport & Mode',
    items: [
      { name: 'Holland & Barrett', tagline: 'Vitamines, sport & health',  cta: 'Bekijk aanbod',    color: '#007A3D', url: AW(8108,   'https://www.hollandandbarrett.nl/shop/aanbiedingen/') },
      { name: 'Vitaepro NL',       tagline: 'Vitamines & gezondheid NL',  cta: 'Bekijk aanbod',    color: '#B71C1C', url: AW(18520,  'https://www.vitaepro.nl/') },
      { name: 'Direct Running',    tagline: 'Hardloopschoenen & kleding', cta: 'Bekijk aanbod',    color: '#E63329', url: AW(71531,  'https://www.direct-running.nl/') },
      { name: 'Direct Volley',     tagline: 'Volleybal gear & kleding',   cta: 'Bekijk aanbod',    color: '#F4A300', url: AW(103041, 'https://www.direct-volley.nl/') },
      { name: 'Sinner',            tagline: 'Sport & outdoorkleding',     cta: 'Bekijk collectie', color: '#D40000', url: DS('16070', '79935',   'https://www.sinner.eu/sale') },
      { name: 'Vitaminstore',      tagline: 'Vitamines & supplementen',   cta: 'Bekijk aanbod',    color: '#00A651', url: DS('16070', '1266442', 'https://www.vitaminstore.nl/aanbiedingen') },
      { name: 'BioProphyl',        tagline: 'Kwalitatieve supplementen',  cta: 'Bekijk aanbod',    color: '#2E7D32', url: AW(22561,  'https://www.bioprophyl.com/') },
      { name: 'Happy Mammoth',     tagline: 'Gut health & supplementen',  cta: 'Bekijk aanbod',    color: '#FF6B35', url: DC('https://glp8.net/c/?si=19600&li=1839644&wi=420902',  'https://eu.happymammoth.com/') },
      { name: 'Plein.nl',          tagline: 'Drogist & gezondheid online', cta: 'Bekijk aanbod',   color: '#0071BC', url: DC('https://fr135.net/c/?si=3366&li=1161224&wi=420902',  'https://www.plein.nl/') },
      { name: "Levi's",            tagline: 'Jeans & kleding sale',       cta: 'Shop collectie',   color: '#C8102E', url: 'https://glp8.net/c/?si=19949&li=1850890&wi=420902' },
      { name: 'Weightworld.nl',    tagline: 'Sportvoeding & gewichten',   cta: 'Bekijk aanbod',    color: '#E53935', url: DC('https://fr135.net/c/?si=15441&li=1670530&wi=420902',  'https://www.weightworld.nl/') },
      { name: 'Oakley',            tagline: 'Sport brillen & kleding',    cta: 'Bekijk collectie', color: '#1A1A1A', url: DC('https://bdt9.net/c/?si=18433&li=1819889&wi=420902',   'https://www.oakley.com/nl-nl/') },
      { name: 'Wolfswinkel NL',    tagline: 'Outdoor gear & sportmode',   cta: 'Bekijk aanbod',    color: '#388E3C', url: AW(119653, 'https://www.wolfswinkel.nl/') },
      { name: '123watches',        tagline: 'Horloges & accessoires',     cta: 'Bekijk collectie', color: '#C62828', url: AW(120982, 'https://www.123watches.nl/') },
      { name: 'Bjorn Borg',  tagline: 'Sportkleding & ondergoed',    cta: 'Bekijk collectie', color: '#003594', url: DC('https://bdt9.net/c/?si=18683&li=1810656&wi=420902',  'https://www.bjornborg.com/nl-nl/') },
      { name: 'Tsar Bomba',      tagline: 'Horloges & premium accessoires', cta: 'Bekijk collectie', color: '#8B0000', url: DC('https://glp8.net/c/?si=21716&li=1916762&wi=420902',  'https://tsarbomba.com/') },
      { name: 'Sportiek.com',    tagline: 'Sportschoenen & kleding',       cta: 'Bekijk aanbod',    color: '#F97316', url: DC('https://ds1.nl/c/?si=8485&li=1389201&wi=420902',       'https://www.sportiek.com/') },
      { name: 'Primal Focus EU', tagline: 'Focus & energie supplementen',  cta: 'Bekijk aanbod',    color: '#0F766E', url: DC('https://glp8.net/c/?si=21577&li=1913855&wi=420902',   'https://primalfocus.eu/') },
      { name: 'Pulsetto',        tagline: 'Vagus zenuw stimulator & stress', cta: 'Bekijk aanbod',  color: '#6366F1', url: AW(81357, 'https://pulsetto.tech/') },
      { name: 'Dr. Martens',     tagline: 'Iconische boots & schoenen',    cta: 'Bekijk collectie', color: '#FFC72C', url: DC('https://fr135.net/c/?si=15138&li=1656908&wi=420902', 'https://www.drmartens.com/nl/nl/') },
      { name: 'Eastpak',         tagline: 'Rugzakken & tassen sale',       cta: 'Bekijk collectie', color: '#FF6B00', url: DC('https://glp8.net/c/?si=20076&li=1857675&wi=420902',  'https://www.eastpak.com/nl-nl/') },
      { name: 'Foreo',           tagline: 'Gezichtsreiniging & beauty tech', cta: 'Bekijk aanbod',  color: '#00BCD4', url: DC('https://jf79.net/c/?si=16254&li=1697784&wi=420902',  'https://www.foreo.com/nl') },
    ],
  },
  {
    id: 'auto',
    category: '🚗 Auto Lease',
    items: [
      { name: 'XLLease',    tagline: 'Private lease deals',       cta: 'Bekijk aanbod',  color: '#003366', url: DC('https://fr135.net/c/?si=20255&li=1864272&wi=420902', 'https://www.xllease.nl/') },
      { name: 'DutchLease', tagline: 'Elektrisch & hybrid lease', cta: 'Bekijk aanbod',  color: '#009FE3', url: DC('https://fr135.net/c/?si=20456&li=1868213&wi=420902', 'https://www.dutchlease.nl/') },
      { name: 'XLEasy',     tagline: 'Private lease vanaf €299',  cta: 'Bereken prijs',  color: '#1A237E', url: DC('https://fr135.net/c/?si=15775&li=1682823&wi=420902', 'https://www.xleasy.nl/') },
    ],
  },
  {
    id: 'tech',
    category: '💻 Tech & Software',
    items: [
      { name: 'McAfee',       tagline: 'Antivirus & internetsecurity', cta: 'Bekijk aanbod', color: '#C8102E', url: DC('https://glp8.net/c/?si=20283&li=1865780&wi=420902', 'https://www.mcafee.com/nl-nl/') },
      { name: '1blu',        tagline: 'Webhosting & domeinen',        cta: 'Bekijk aanbod', color: '#1A5FA8', url: DC('https://glp8.net/c/?si=21031&li=1894705&wi=420902', 'https://www.1blu.de/') },
      { name: 'Plaud',       tagline: 'AI-gestuurde voicerecorder',   cta: 'Bekijk aanbod', color: '#2C2C54', url: DC('https://glp8.net/c/?si=21213&li=1903643&wi=420902', 'https://www.plaud.ai/') },
      { name: 'Amazon Music', tagline: 'Muziek streamen zonder limits', cta: 'Probeer gratis', color: '#00A8E1', url: DC('https://glp8.net/c/?si=20174&li=1861301&wi=420902', 'https://music.amazon.nl/') },
      { name: 'Omnisend',        tagline: 'Email & SMS marketing tool',   cta: 'Probeer gratis', color: '#4A90D9', url: DC('https://glp8.net/c/?si=20641&li=1874887&wi=420902', 'https://www.omnisend.com/') },
      { name: 'Quadcopter-shop', tagline: 'Drones voor hobby & pro',      cta: 'Bekijk drones',  color: '#37474F', url: DC('https://bdt9.net/c/?si=18088&li=1783485&wi=420902',   'https://www.quadcopter-shop.nl/') },
      { name: 'Difmark',         tagline: 'Refurbished smartphones met korting', cta: 'Bekijk aanbod', color: '#059669', url: DC('https://glp8.net/c/?si=20242&li=1863153&wi=420902', 'https://www.difmark.com/') },
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
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(201,193,182,0.4)',
            boxShadow: '0 2px 0 #DDD0C4',
          }}
        >
          <span
            className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap flex-none"
            style={{ color: '#8C8478', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            💡 Meer besparen
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {FEATURED_BRANDS.map(b => (
              <button
                key={b.name}
                onClick={() => onOpen(b.category)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-none"
                style={{
                  background: `${b.color}12`,
                  border: `1px solid ${b.color}35`,
                  color: b.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: b.color }} />
                {b.name}
              </button>
            ))}
          </div>
          <span
            className="text-[10px] font-medium whitespace-nowrap flex-none"
            style={{ color: '#C9C1B6' }}
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
                          try {
                            // @ts-ignore
                            if (typeof gtag !== 'undefined') gtag('event', 'affiliate_click', { affiliate_name: item.name, affiliate_category: activeGroup.id })
                          } catch {}
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
