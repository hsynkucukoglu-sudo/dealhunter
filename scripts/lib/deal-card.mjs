// Gedeelde kaartopmaak voor alle kanalen.
//
// Waarom apart: de opmaak zat in whatsapp-sender.mjs. Bij een tweede kanaal zou
// die gekopieerd worden en daarna stilletjes uit elkaar lopen — precies wat er
// met AFFILIATE_DEALS is gebeurd (2026-08-19: 3 van de 12 links dood, omdat de
// lijst los stond van die op de site).
//
// Per kanaal verschilt alleen het *markeren* en het *escapen*, niet de tekst.
// Telegram gebruikt HTML in plaats van MarkdownV2: MarkdownV2 eist dat je
// _*[]()~>#+-=|{}.! allemaal escapet, en één gemiste punt in een productnaam
// laat de hele boodschap mislukken. Met HTML zijn het er drie.

const KANALEN = {
  whatsapp: {
    vet: (s) => `*${s}*`,
    door: (s) => `~${s}~`,
    schuin: (s) => `_${s}_`,
    esc: (s) => String(s),
  },
  telegram: {
    vet: (s) => `<b>${s}</b>`,
    door: (s) => `<s>${s}</s>`,
    schuin: (s) => `<i>${s}</i>`,
    esc: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  },
}

export const MARKET_SLUGS = {
  'Albert Heijn': 'albert-heijn', Jumbo: 'jumbo', Lidl: 'lidl', Dirk: 'dirk',
  Aldi: 'aldi', Hoogvliet: 'hoogvliet', Vomar: 'vomar', DekaMarkt: 'dekamarkt',
  Coop: 'coop', Plus: 'plus', Kruidvat: 'kruidvat',
}

const euro = (n) => '€' + Number(n).toFixed(2).replace('.', ',')

// Alleen links naar de eigen site krijgen een kanaalmerk. Affiliate-links zijn
// trackinglinks van het netwerk; daar een parameter aan plakken kan de redirect
// breken en die kliks meten we sowieso in het netwerkpaneel, niet in Clarity.
export function siteLink(pad, kanaal, siteUrl = 'https://www.dealhunter4u.nl') {
  const scheiding = pad.includes('?') ? '&' : '?'
  return `${siteUrl}${pad}${scheiding}c=${kanaal}`
}

function voettekst(f) {
  return f.schuin('DealHunter4U · Elke dag besparen')
}

export function productKaart(p, { kanaal = 'whatsapp', siteUrl } = {}) {
  const f = KANALEN[kanaal]
  if (!f) throw new Error(`Onbekend kanaal: ${kanaal}`)

  const slug = MARKET_SLUGS[p.market] ?? String(p.market).toLowerCase().replace(/\s+/g, '-')
  const link = siteLink(`/supermarkt/${slug}`, kanaal, siteUrl)
  const vervalt = p.expiresAt
    ? new Date(p.expiresAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
    : null

  const regels = [
    `🔥 ${f.vet('Aanbieding van de dag!')}`,
    '',
    `🛒 ${f.vet(f.esc(p.name))}`,
    `🏪 ${f.esc(p.market)}  |  📉 -${f.vet(p.discount + '%')} korting`,
    `💰 ${f.door(euro(p.originalPrice))} → ${f.vet(euro(p.discountedPrice))}`,
  ]
  if (vervalt) regels.push(`📅 Geldig t/m ${vervalt}`)
  regels.push('', `👉 Meer deals: ${link}`, '', `🤖 ${voettekst(f)}`)
  return regels.join('\n')
}

export function affiliateKaart(deal, { kanaal = 'whatsapp' } = {}) {
  const f = KANALEN[kanaal]
  if (!f) throw new Error(`Onbekend kanaal: ${kanaal}`)

  return [
    `💡 ${f.vet('Deal tip van DealHunter4U!')}`,
    '',
    `${deal.emoji} ${f.vet(f.esc(deal.naam))}`,
    f.esc(deal.tagline),
    '',
    `👉 ${deal.url}`,
    '',
    `🤖 ${voettekst(f)}`,
  ].join('\n')
}
