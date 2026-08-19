// Dagelijkse edities voor de Shorts-pipeline.
//
// Waarom: de video was "top 5 van de week", maar folderdeals verversen wekelijks
// (ma/wo). Elke dag dezelfde selectie uploaden levert zeven keer bijna dezelfde
// video op — dat leest als duplicaat en voegt niets toe. Elke weekdag krijgt
// daarom een eigen invalshoek die een ándere doorsnede van dezelfde dataset laat
// zien.
//
// Gemeten op de live dataset (2026-08-19, 525 bruikbare producten):
//   kassakoopjes <€5 .......... 406
//   besparing >= €5 ............ 59
//   actie (1+1 / 2e halve) ..... 78
//   categorieën met >=18 ....... 9
//   markten met >=12 ........... 10
// "Laatste kans" is bewust géén editie: expiresAt staat voor vrijwel alles op de
// eerstvolgende zondag, dus "verloopt binnen 2 dagen" leverde 0 producten op.

const CATEGORIEEN = [
  { id: 'groente-fruit', label: 'Groente & Fruit', emoji: '🥦' },
  { id: 'vlees-vis', label: 'Vlees & Vis', emoji: '🥩' },
  { id: 'zuivel', label: 'Zuivel', emoji: '🥛' },
  { id: 'dranken', label: 'Dranken', emoji: '🥤' },
  { id: 'snacks', label: 'Snacks', emoji: '🍫' },
  { id: 'maaltijden', label: 'Maaltijden', emoji: '🍝' },
  { id: 'huishouden', label: 'Huishouden', emoji: '🧽' },
  { id: 'verzorging', label: 'Verzorging', emoji: '🧴' },
  { id: 'bakkerij', label: 'Bakkerij', emoji: '🥖' },
]

// Alleen markten met genoeg volume om vijf kaarten te vullen.
const MARKTEN = ['Albert Heijn', 'Jumbo', 'Plus', 'Dirk', 'DekaMarkt', 'Lidl', 'Kruidvat', 'Aldi', 'Vomar', 'Hoogvliet']

const euro = (n) => '€' + n.toFixed(2).replace('.', ',')
const besparing = (d) => d.orig - d.price

// Roteert per week, zodat twee opeenvolgende weken niet dezelfde categorie of
// markt pakken. De offset scheidt de twee categorie-dagen binnen één week.
const roteer = (lijst, week, offset = 0) => lijst[(week * 2 + offset) % lijst.length]

const SITE = 'https://www.dealhunter4u.nl'
const BASIS_TAGS = ['aanbiedingen', 'besparen', 'boodschappen', 'supermarkt', 'folder', 'korting']

function beschrijving(regels) {
  return [...regels, '', `Alle actuele aanbiedingen op één plek: ${SITE}`, '', '#aanbiedingen #besparen #boodschappen #supermarkt #shorts'].join('\n')
}

// Elke editie levert: een selectie van maximaal 5 deals, de teksten voor de
// hook-scene, en de YouTube-metadata. `pool` bevat alleen producten die de
// prijs- en beeldcontroles van make-video.mjs al hebben doorstaan.
export const EDITIES = {
  top5: {
    id: 'top5',
    naam: 'Top 5 van de week',
    select(pool) {
      const perMarkt = {}
      for (const d of pool) {
        if (!perMarkt[d.market] || d.disc > perMarkt[d.market].disc) perMarkt[d.market] = d
      }
      return Object.values(perMarkt).sort((a, b) => b.disc - a.disc).slice(0, 5)
    },
    hook: (deals) => ({
      titel: 'TOP <b>5</b>',
      onder: 'SUPERMARKT DEALS',
      note: `van deze week — tot ${Math.max(...deals.map(d => d.disc))}% korting`,
      emoji: '🔥',
    }),
    youtube: (deals, { week }) => ({
      title: `Top 5 Supermarkt Deals — Week ${week} 🛒 #Shorts`,
      description: beschrijving([`De 5 scherpste supermarktaanbiedingen van week ${week}, uit de actuele folders van Albert Heijn, Jumbo, Lidl, Aldi, Dirk en meer.`]),
      tags: [...BASIS_TAGS, 'albert heijn', 'jumbo', 'lidl', 'aldi'],
    }),
  },

  categorie: {
    id: 'categorie',
    naam: 'Categorie van de dag',
    kies: (week, offset) => roteer(CATEGORIEEN, week, offset),
    select(pool, { keuze }) {
      return pool.filter(d => d.category === keuze.id).sort((a, b) => b.disc - a.disc).slice(0, 5)
    },
    hook: (deals, { keuze }) => ({
      titel: keuze.label.toUpperCase(),
      onder: 'IN DE AANBIEDING',
      note: `tot ${Math.max(...deals.map(d => d.disc))}% korting deze week`,
      emoji: keuze.emoji,
    }),
    youtube: (deals, { keuze, week }) => ({
      title: `${keuze.label} aanbiedingen — week ${week} ${keuze.emoji} #Shorts`,
      description: beschrijving([`De scherpste ${keuze.label.toLowerCase()}-aanbiedingen van week ${week}, vergeleken over tien supermarkten.`]),
      tags: [...BASIS_TAGS, keuze.label.toLowerCase(), keuze.id.replace('-', ' ')],
    }),
  },

  markt: {
    id: 'markt',
    naam: 'Markt van de dag',
    kies: (week, offset) => roteer(MARKTEN, week, offset),
    select(pool, { keuze }) {
      return pool.filter(d => d.market === keuze).sort((a, b) => b.disc - a.disc).slice(0, 5)
    },
    hook: (deals, { keuze }) => ({
      titel: keuze.toUpperCase(),
      onder: 'BESTE DEALS',
      note: `tot ${Math.max(...deals.map(d => d.disc))}% korting deze week`,
      emoji: '🏪',
    }),
    youtube: (deals, { keuze, week }) => ({
      title: `${keuze} aanbiedingen — week ${week} 🏪 #Shorts`,
      description: beschrijving([`De beste ${keuze}-aanbiedingen van week ${week}. Vergelijk ze met negen andere supermarkten.`]),
      tags: [...BASIS_TAGS, keuze.toLowerCase()],
    }),
  },

  kassakoopjes: {
    id: 'kassakoopjes',
    naam: 'Kassakoopjes onder €5',
    select(pool) {
      return pool.filter(d => d.price < 5).sort((a, b) => b.disc - a.disc).slice(0, 5)
    },
    hook: () => ({
      titel: 'ONDER <b>€5</b>',
      onder: 'KASSAKOOPJES',
      note: 'vijf deals die bijna niets kosten',
      emoji: '💸',
    }),
    youtube: (deals, { week }) => ({
      title: `5 supermarktdeals onder €5 — week ${week} 💸 #Shorts`,
      description: beschrijving([`Vijf aanbiedingen van week ${week} die allemaal onder de vijf euro blijven.`]),
      tags: [...BASIS_TAGS, 'goedkoop', 'kassakoopjes'],
    }),
  },

  bespaar: {
    id: 'bespaar',
    naam: 'Grootste besparing in euro',
    select(pool) {
      return pool.filter(d => besparing(d) >= 3).sort((a, b) => besparing(b) - besparing(a)).slice(0, 5)
    },
    hook: (deals) => ({
      titel: 'TOT <b>' + euro(Math.max(...deals.map(besparing))) + '</b>',
      onder: 'VOORDEEL PER PRODUCT',
      note: 'niet het percentage — de echte euro’s',
      emoji: '💶',
    }),
    youtube: (deals, { week }) => ({
      title: `Hier bespaar je het meest — week ${week} 💶 #Shorts`,
      description: beschrijving([`Niet het hoogste kortingspercentage, maar de grootste besparing in euro's. Week ${week}.`]),
      tags: [...BASIS_TAGS, 'voordeel', 'grootste korting'],
    }),
  },

  actie: {
    id: 'actie',
    naam: '1+1 gratis & 2e halve prijs',
    select(pool) {
      const ACTIES = new Set(['1+1', '2e-halve-prijs', '3-halen-2-betalen'])
      return pool.filter(d => ACTIES.has(d.campaignType)).sort((a, b) => b.disc - a.disc).slice(0, 5)
    },
    hook: () => ({
      titel: '1+1 <b>GRATIS</b>',
      onder: '& 2E HALVE PRIJS',
      note: 'de beste stapelacties van deze week',
      emoji: '🎁',
    }),
    youtube: (deals, { week }) => ({
      title: `1+1 gratis & 2e halve prijs — week ${week} 🎁 #Shorts`,
      description: beschrijving([`De beste stapelacties van week ${week}: 1+1 gratis, 2e halve prijs en 3 halen 2 betalen.`]),
      tags: [...BASIS_TAGS, '1+1 gratis', '2e halve prijs'],
    }),
  },
}

// Weekdag → editie. Maandag = top5, want dan zijn de folders het verst.
// Categorie komt twee keer voor met een andere rotatie-offset, zodat dinsdag en
// zaterdag nooit dezelfde categorie pakken.
const WEEKPLAN = [
  { editie: 'actie', offset: 0 },        // zondag
  { editie: 'top5', offset: 0 },         // maandag
  { editie: 'categorie', offset: 0 },    // dinsdag
  { editie: 'markt', offset: 0 },        // woensdag
  { editie: 'kassakoopjes', offset: 0 }, // donderdag
  { editie: 'bespaar', offset: 0 },      // vrijdag
  { editie: 'categorie', offset: 1 },    // zaterdag
]

export function planVoorDag(datum = new Date()) {
  return WEEKPLAN[datum.getDay()]
}

export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - start) / 86400000 + 1) / 7)
}
